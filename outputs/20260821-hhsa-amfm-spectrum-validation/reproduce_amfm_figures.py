"""重現並量化兩篇指定 HHSA 論文的代表性 AM-FM 模擬圖。

本程式只處理 synthetic ground truth，不分析病人資料。核心算法直接使用
`hhsa.py`：兩層皆採 plain EMD、以 PCHIP 建立正值 envelope，並在 HHS
累積前逐點排除 ``f_am >= f_carrier``。
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from hhsa import emd, hilbert_marginal, holo_spectrum, inst_freq


FS = 1_000.0
F_EDGES = np.geomspace(0.5, 128.0, 193)
W_EDGES = np.geomspace(0.5, 32.0, 145)
F_CENTERS = np.sqrt(F_EDGES[:-1] * F_EDGES[1:])
W_CENTERS = np.sqrt(W_EDGES[:-1] * W_EDGES[1:])


def _signal_time(duration_s: float, fs: float = FS) -> np.ndarray:
    """產生不包含終點的等距時間軸。"""
    return np.arange(round(duration_s * fs), dtype=float) / fs


def _analyse(signal: np.ndarray, fs: float = FS, max_imf: int = 9) -> dict[str, Any]:
    """執行 layer-1 EMD、HHT marginal 與 layer-2 HHS。"""
    dt = 1.0 / fs
    imfs, residual = emd(signal, max_imf=max_imf)
    edge_trim = min(round(0.25 * fs), max(0, signal.size // 10))
    marginal, _ = hilbert_marginal(imfs, dt, F_EDGES, edge_trim=edge_trim)
    holo, _, diagnostic = holo_spectrum(
        imfs,
        dt,
        F_EDGES,
        W_EDGES,
        n_imf2=7,
        ensemble=1,
        edge_trim=edge_trim,
    )
    reconstruction_error = float(
        np.max(np.abs(imfs.sum(axis=0) + residual - signal))
    )
    return {
        "imfs": imfs,
        "residual": residual,
        "marginal": marginal,
        "holo": holo,
        "diagnostic": diagnostic,
        "reconstruction_error": reconstruction_error,
    }


def _band_mask(centers: np.ndarray, limits: tuple[float, float]) -> np.ndarray:
    return (centers >= limits[0]) & (centers <= limits[1])


def _hht_peak(analysis: dict[str, Any], limits: tuple[float, float]) -> float:
    """回傳指定頻帶內 HHT marginal 的最大值頻率。"""
    mask = _band_mask(F_CENTERS, limits)
    values = analysis["marginal"][mask]
    return float(F_CENTERS[mask][int(np.argmax(values))])


def _holo_peak(
    analysis: dict[str, Any],
    carrier_limits: tuple[float, float],
    modulation_limits: tuple[float, float],
) -> tuple[float, float, float]:
    """回傳指定 ROI 內的 carrier peak、AM peak 與總能量。"""
    f_mask = _band_mask(F_CENTERS, carrier_limits)
    w_mask = _band_mask(W_CENTERS, modulation_limits)
    roi = analysis["holo"][np.ix_(f_mask, w_mask)]
    flat_index = int(np.argmax(roi))
    i, j = np.unravel_index(flat_index, roi.shape)
    return (
        float(F_CENTERS[f_mask][i]),
        float(W_CENTERS[w_mask][j]),
        float(roi.sum()),
    )


def _target_cell_energy(
    analysis: dict[str, Any],
    carrier_hz: float,
    modulation_hz: float,
    relative_width: float = 0.18,
) -> float:
    """積分預先指定 AM-FM cell 周圍的能量。"""
    f_limits = (
        carrier_hz * (1.0 - relative_width),
        carrier_hz * (1.0 + relative_width),
    )
    w_limits = (
        modulation_hz * (1.0 - relative_width),
        modulation_hz * (1.0 + relative_width),
    )
    return _holo_peak(analysis, f_limits, w_limits)[2]


def _median_imf_frequency(imf: np.ndarray, fs: float = FS) -> float:
    _, frequency = inst_freq(imf, 1.0 / fs)
    core = frequency[round(0.25 * fs) : -round(0.25 * fs)]
    valid = core[np.isfinite(core) & (core > 0)]
    return float(np.median(valid)) if valid.size else float("nan")


def _time_resolved_am_strength(
    signal: np.ndarray,
    sample_times: list[float],
    carrier_hz: float,
    modulation_hz: float,
    fs: float = FS,
) -> tuple[list[float], float, float]:
    """由 layer-2 IMF 的 instantaneous amplitude 取得時間解析 AM 強度。

    論文 Fig. 5 顯示單一時間點的 HHS。本函式不做 sliding-window 重分解，
    而是先在完整 4 秒訊號上完成兩層 EMD，再讀取最接近指定 AM frequency
    的 layer-2 IMF amplitude；可避免一秒視窗只有四個 AM cycles 的不穩定。
    """
    imfs, residual = emd(signal, max_imf=9)
    carrier_frequencies = np.array([_median_imf_frequency(c, fs) for c in imfs])
    carrier_index = int(np.nanargmin(np.abs(carrier_frequencies - carrier_hz)))
    carrier_imf = imfs[carrier_index]
    envelope, carrier_if = inst_freq(carrier_imf, 1.0 / fs)
    am_imfs, _ = emd(envelope, max_imf=7)
    am_frequencies = np.array([_median_imf_frequency(c, fs) for c in am_imfs])
    am_index = int(np.nanargmin(np.abs(am_frequencies - modulation_hz)))
    am_amplitude, _ = inst_freq(am_imfs[am_index], 1.0 / fs)

    half_window = round(0.08 * fs)
    strengths: list[float] = []
    for sample_time in sample_times:
        center = round(sample_time * fs)
        lo = max(0, center - half_window)
        hi = min(signal.size, center + half_window + 1)
        strengths.append(float(np.median(am_amplitude[lo:hi] ** 2)))

    reconstruction_error = float(
        np.max(np.abs(imfs.sum(axis=0) + residual - signal))
    )
    return strengths, float(carrier_frequencies[carrier_index]), reconstruction_error


def _skill_ground_truth() -> tuple[dict[str, Any], dict[str, Any]]:
    """執行 skill SKILL.md 明定的 3 h / 24 h ground truth。"""
    dt_h = 5.0 / 60.0
    t_h = np.arange(3744, dtype=float) * dt_h
    signal = (
        (1.0 + 0.5 * np.cos(2 * np.pi * t_h / 24.0))
        * np.cos(2 * np.pi * t_h / 3.0)
        + 0.7 * np.cos(2 * np.pi * t_h / 12.0)
    )
    imfs, residual = emd(signal, max_imf=8)
    f_edges = np.geomspace(1 / 200.0, 1 / 0.4, 41)
    w_edges = np.geomspace(1 / 400.0, 1 / 2.0, 31)
    f_centers = np.sqrt(f_edges[:-1] * f_edges[1:])
    w_centers = np.sqrt(w_edges[:-1] * w_edges[1:])
    holo, _, diagnostic = holo_spectrum(
        imfs,
        dt_h,
        f_edges,
        w_edges,
        n_imf2=5,
        ensemble=1,
        edge_trim=200,
    )
    carrier_mask = (1 / f_centers > 2.2) & (1 / f_centers < 4.2)
    modulation_energy = holo[carrier_mask].sum(axis=0)
    recovered_period_h = float(
        np.exp(
            np.sum(modulation_energy * np.log(1 / w_centers))
            / modulation_energy.sum()
        )
    )
    reconstruction_error = float(
        np.max(np.abs(imfs.sum(axis=0) + residual - signal))
    )
    result = {
        "expected_carrier_period_h": 3.0,
        "expected_modulation_period_h": 24.0,
        "recovered_modulation_period_h": recovered_period_h,
        "relative_error": abs(recovered_period_h - 24.0) / 24.0,
        "reconstruction_error": reconstruction_error,
        "rejected_fraction": float(diagnostic["rejected_fraction"]),
    }
    result["passed"] = bool(
        result["relative_error"] < 0.15 and reconstruction_error < 1e-10
    )
    return result, {"t": t_h, "signal": signal, "holo": holo}


def _nguyen_s1() -> tuple[dict[str, Any], dict[str, Any]]:
    """Nguyen 2019 Supplementary Fig. S1：2 Hz additive + <3|14> AM。"""
    t = _signal_time(6.0)
    s1 = 0.5 * np.sin(2 * np.pi * 2.0 * t)
    # 論文以兩個 sinusoid 的乘積建立 S2；其絕對 envelope 為 3 Hz。
    s2 = np.sin(2 * np.pi * 1.5 * t) * np.sin(2 * np.pi * 14.0 * t)
    signal = s1 + s2
    analysis = _analyse(signal)
    peak_2 = _hht_peak(analysis, (1.6, 2.4))
    peak_14 = _hht_peak(analysis, (11.0, 17.0))
    carrier_peak, modulation_peak, target_energy = _holo_peak(
        analysis, (11.0, 17.0), (2.4, 3.6)
    )
    carrier_mask = _band_mask(F_CENTERS, (11.0, 17.0))
    target_am_mask = _band_mask(W_CENTERS, (2.0, 4.0))
    comparison_am_mask = _band_mask(W_CENTERS, (0.5, 8.0))
    target_band_energy = float(
        analysis["holo"][np.ix_(carrier_mask, target_am_mask)].sum()
    )
    comparison_energy = float(
        analysis["holo"][np.ix_(carrier_mask, comparison_am_mask)].sum()
    )
    dyadic_concentration = target_band_energy / comparison_energy
    result = {
        "expected_additive_hz": 2.0,
        "recovered_additive_hz": peak_2,
        "expected_carrier_hz": 14.0,
        "recovered_carrier_hz": peak_14,
        "expected_modulation_hz": 3.0,
        "holo_carrier_peak_hz": carrier_peak,
        "holo_modulation_peak_hz": modulation_peak,
        "target_energy": target_energy,
        "dyadic_2_to_4_hz_concentration": dyadic_concentration,
        "reconstruction_error": analysis["reconstruction_error"],
        "rejected_fraction": float(analysis["diagnostic"]["rejected_fraction"]),
    }
    result["passed"] = bool(
        abs(peak_2 - 2.0) / 2.0 < 0.20
        and abs(peak_14 - 14.0) / 14.0 < 0.20
        and abs(carrier_peak - 14.0) / 14.0 < 0.20
        and abs(modulation_peak - 3.0) / 3.0 < 0.15
        and dyadic_concentration > 0.60
        and target_energy > 0
        and analysis["reconstruction_error"] < 1e-10
    )
    return result, {"t": t, "s1": s1, "s2": s2, "signal": signal, **analysis}


def _juan_fig4() -> tuple[dict[str, Any], dict[str, Any]]:
    """Juan 2021 Fig. 4：beta = 0、0.4、1.0 的固定 coupling strength。"""
    t = _signal_time(4.0)
    analyses: dict[str, Any] = {}
    energies: list[float] = []
    for beta in (0.0, 0.4, 1.0):
        # PDF 式 (1)-(3) 的文字層遺漏正 envelope baseline；依 Fig. 4 所示
        # 「無調變但仍有 32 Hz carrier」採標準 1 + beta*cos(4 Hz t)。
        envelope = 1.0 + beta * np.cos(2 * np.pi * 4.0 * t)
        signal = np.sin(2 * np.pi * 4.0 * t) + envelope * np.sin(
            2 * np.pi * 32.0 * t
        )
        analysis = _analyse(signal)
        energy = _target_cell_energy(analysis, 32.0, 4.0)
        key = f"beta_{beta:.1f}"
        analyses[key] = {"signal": signal, "envelope": envelope, **analysis}
        energies.append(energy)
    floor = max(energies[0], np.finfo(float).eps)
    result = {
        "betas": [0.0, 0.4, 1.0],
        "target_energies": energies,
        "energy_ratio_beta1_to_beta0": float(energies[2] / floor),
        "energy_ratio_beta04_to_beta0": float(energies[1] / floor),
        "monotonic": bool(energies[0] < energies[1] < energies[2]),
        "reconstruction_errors": [
            float(analyses[key]["reconstruction_error"]) for key in analyses
        ],
        "rejected_fractions": [
            float(analyses[key]["diagnostic"]["rejected_fraction"])
            for key in analyses
        ],
        "formula_assumption": "A_fA(t) = K * [1 + beta*cos(2*pi*4*t)]",
    }
    result["passed"] = bool(
        result["monotonic"]
        and result["energy_ratio_beta04_to_beta0"] > 100.0
        and max(result["reconstruction_errors"]) < 1e-10
    )
    return result, {"t": t, "analyses": analyses}


def _juan_fig5() -> tuple[dict[str, Any], dict[str, Any]]:
    """Juan 2021 Fig. 5：0 到 1 線性增加的 time-varying coupling。"""
    t = _signal_time(4.0)
    beta = t / t[-1]
    envelope = 1.0 + beta * np.cos(2 * np.pi * 4.0 * t)
    signal = np.sin(2 * np.pi * 4.0 * t) + envelope * np.sin(
        2 * np.pi * 32.0 * t
    )
    sample_times = [0.5, 1.5, 2.5, 3.5]
    strengths, recovered_carrier_hz, reconstruction_error = (
        _time_resolved_am_strength(signal, sample_times, 32.0, 4.0)
    )
    expected_betas = np.array([time / 4.0 for time in sample_times])
    beta_squared_correlation = float(
        np.corrcoef(expected_betas**2, np.asarray(strengths))[0, 1]
    )
    result = {
        "sample_times_s": sample_times,
        "expected_betas": expected_betas.tolist(),
        "recovered_am_strengths": strengths,
        "recovered_carrier_hz": recovered_carrier_hz,
        "monotonic": bool(all(a < b for a, b in zip(strengths, strengths[1:]))),
        "beta_squared_correlation": beta_squared_correlation,
        "reconstruction_error": reconstruction_error,
    }
    result["passed"] = bool(
        result["monotonic"]
        and beta_squared_correlation > 0.99
        and abs(recovered_carrier_hz - 32.0) / 32.0 < 0.20
        and reconstruction_error < 1e-10
    )
    return result, {
        "t": t,
        "beta": beta,
        "envelope": envelope,
        "signal": signal,
        "strengths": strengths,
    }


def _juan_fig6() -> tuple[dict[str, Any], dict[str, Any]]:
    """Juan 2021 Fig. 6：多 carrier 與多 AM frequency 的兩種組合。"""
    t = _signal_time(6.0)
    slow = np.sin(2 * np.pi * 4.0 * t)
    signal_a = (
        slow
        + (1.0 + 0.8 * np.cos(2 * np.pi * 4.0 * t))
        * np.sin(2 * np.pi * 32.0 * t)
        + (1.0 + 0.8 * np.cos(2 * np.pi * 4.0 * t))
        * np.sin(2 * np.pi * 64.0 * t)
    )
    signal_b = (
        slow
        + (
            2.0
            + 0.8 * np.cos(2 * np.pi * 4.0 * t)
            + 0.8 * np.cos(2 * np.pi * 8.0 * t)
        )
        * np.sin(2 * np.pi * 32.0 * t)
    )
    analysis_a = _analyse(signal_a)
    analysis_b = _analyse(signal_b)
    cells = {
        "case_a_32_by_4": _target_cell_energy(analysis_a, 32.0, 4.0),
        "case_a_64_by_4": _target_cell_energy(analysis_a, 64.0, 4.0),
        "case_b_32_by_4": _target_cell_energy(analysis_b, 32.0, 4.0),
        "case_b_32_by_8": _target_cell_energy(analysis_b, 32.0, 8.0),
    }
    controls = {
        "case_a_32_by_8": _target_cell_energy(analysis_a, 32.0, 8.0),
        "case_a_64_by_8": _target_cell_energy(analysis_a, 64.0, 8.0),
        "case_b_64_by_4": _target_cell_energy(analysis_b, 64.0, 4.0),
        "case_b_64_by_8": _target_cell_energy(analysis_b, 64.0, 8.0),
    }
    floor = np.finfo(float).eps
    specificity_ratios = {
        "case_a_32": cells["case_a_32_by_4"] / max(controls["case_a_32_by_8"], floor),
        "case_a_64": cells["case_a_64_by_4"] / max(controls["case_a_64_by_8"], floor),
        "case_b_4hz": cells["case_b_32_by_4"] / max(controls["case_b_64_by_4"], floor),
        "case_b_8hz": cells["case_b_32_by_8"] / max(controls["case_b_64_by_8"], floor),
    }
    result = {
        "target_cell_energies": cells,
        "negative_control_cell_energies": controls,
        "specificity_ratios": specificity_ratios,
        "all_target_cells_positive": bool(all(value > 0 for value in cells.values())),
        "reconstruction_errors": [
            analysis_a["reconstruction_error"],
            analysis_b["reconstruction_error"],
        ],
        "rejected_fractions": [
            float(analysis_a["diagnostic"]["rejected_fraction"]),
            float(analysis_b["diagnostic"]["rejected_fraction"]),
        ],
    }
    result["passed"] = bool(
        result["all_target_cells_positive"]
        and min(specificity_ratios.values()) > 10.0
        and max(result["reconstruction_errors"]) < 1e-10
    )
    return result, {
        "t": t,
        "signal_a": signal_a,
        "signal_b": signal_b,
        "analysis_a": analysis_a,
        "analysis_b": analysis_b,
    }


def _plot_holo(ax: plt.Axes, analysis: dict[str, Any], title: str) -> None:
    power = np.asarray(analysis["holo"], dtype=float).T
    log_power = 10.0 * np.log10(power + np.finfo(float).eps)
    mesh = ax.pcolormesh(F_EDGES, W_EDGES, log_power, shading="auto", cmap="magma")
    ax.set_xscale("log", base=2)
    ax.set_yscale("log", base=2)
    ax.set_xlim(1, 128)
    ax.set_ylim(0.5, 32)
    ax.set_xlabel("Carrier frequency fc (Hz)")
    ax.set_ylabel("AM frequency fam (Hz)")
    ax.set_title(title)
    plt.colorbar(mesh, ax=ax, label="Power (dB)")


def _make_figures(output_dir: Path, data: dict[str, Any]) -> None:
    """輸出四張對應論文案例的代表性圖。"""
    nguyen = data["nguyen_s1"]
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.2), constrained_layout=True)
    axes[0].plot(nguyen["t"], nguyen["signal"], color="#17324d", lw=0.9)
    axes[0].set(xlabel="Time (s)", ylabel="Amplitude", title="Nguyen S1: S3 = S1 + S2")
    axes[1].plot(F_CENTERS, nguyen["marginal"], color="#1b7f79")
    axes[1].set_xscale("log", base=2)
    axes[1].set_xlim(0.5, 64)
    axes[1].set(xlabel="Carrier frequency (Hz)", ylabel="Energy", title="Layer-1 HHT marginal")
    _plot_holo(axes[2], nguyen, "HHS: expected <3 fam | 14 fc>")
    fig.savefig(output_dir / "figure_01_nguyen_s1_reproduction.png", dpi=180)
    plt.close(fig)

    fig4 = data["juan_fig4"]
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.2), constrained_layout=True)
    for ax, (key, analysis) in zip(axes, fig4["analyses"].items()):
        _plot_holo(ax, analysis, key.replace("_", " = "))
    fig.savefig(output_dir / "figure_02_juan_coupling_strength.png", dpi=180)
    plt.close(fig)

    fig5 = data["juan_fig5"]
    fig, axes = plt.subplots(2, 1, figsize=(11, 6.5), constrained_layout=True)
    axes[0].plot(fig5["t"], fig5["signal"], color="#17324d", lw=0.8)
    axes[0].plot(fig5["t"], fig5["envelope"], color="#c85a17", lw=1.2, label="True envelope")
    axes[0].set(xlabel="Time (s)", ylabel="Amplitude", title="Juan Fig. 5 time-varying AM")
    axes[0].legend()
    axes[1].plot([0.5, 1.5, 2.5, 3.5], fig5["strengths"], "o-", color="#1b7f79")
    axes[1].set(xlabel="Time (s)", ylabel="Recovered layer-2 AM power", title="AM strength at the four reported time points")
    fig.savefig(output_dir / "figure_03_juan_time_varying.png", dpi=180)
    plt.close(fig)

    fig6 = data["juan_fig6"]
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5), constrained_layout=True)
    _plot_holo(axes[0], fig6["analysis_a"], "Fig. 6A: 32 & 64 Hz by 4 Hz")
    _plot_holo(axes[1], fig6["analysis_b"], "Fig. 6B: 32 Hz by 4 & 8 Hz")
    fig.savefig(output_dir / "figure_04_juan_multiple_patterns.png", dpi=180)
    plt.close(fig)


def _json_ready(value: Any) -> Any:
    """將 NumPy scalar 轉為 JSON 可序列化型別。"""
    if isinstance(value, dict):
        return {key: _json_ready(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_ready(item) for item in value]
    if isinstance(value, np.generic):
        return value.item()
    return value


def run_validation(output_dir: Path, make_figures: bool = True) -> dict[str, Any]:
    """執行所有案例並回傳不含大型 arrays 的驗證結果。"""
    output_dir.mkdir(parents=True, exist_ok=True)
    skill_result, skill_data = _skill_ground_truth()
    nguyen_result, nguyen_data = _nguyen_s1()
    fig4_result, fig4_data = _juan_fig4()
    fig5_result, fig5_data = _juan_fig5()
    fig6_result, fig6_data = _juan_fig6()

    reconstruction_errors = [
        skill_result["reconstruction_error"],
        nguyen_result["reconstruction_error"],
        *fig4_result["reconstruction_errors"],
        fig5_result["reconstruction_error"],
        *fig6_result["reconstruction_errors"],
    ]
    rejected_fractions = [
        skill_result["rejected_fraction"],
        nguyen_result["rejected_fraction"],
        *fig4_result["rejected_fractions"],
        *fig6_result["rejected_fractions"],
    ]
    invariants = {
        "layer_1_method": "plain EMD",
        "layer_2_method": "plain EMD",
        "admissibility": "f_am < f_carrier",
        "max_reconstruction_error": max(reconstruction_errors),
        "max_rejected_fraction": max(rejected_fractions),
    }
    invariants["passed"] = bool(invariants["max_reconstruction_error"] < 1e-10)

    results = {
        "skill_ground_truth": skill_result,
        "nguyen_s1": nguyen_result,
        "juan_fig4": fig4_result,
        "juan_fig5": fig5_result,
        "juan_fig6": fig6_result,
        "invariants": invariants,
    }
    results["all_passed"] = bool(
        all(results[key]["passed"] for key in results if key != "all_passed")
    )

    if make_figures:
        _make_figures(
            output_dir,
            {
                "skill_ground_truth": skill_data,
                "nguyen_s1": nguyen_data,
                "juan_fig4": fig4_data,
                "juan_fig5": fig5_data,
                "juan_fig6": fig6_data,
            },
        )

    with (output_dir / "amfm_validation_results.json").open("w", encoding="utf-8") as handle:
        json.dump(_json_ready(results), handle, ensure_ascii=False, indent=2)

    rows = [
        ("skill_ground_truth", skill_result["passed"], skill_result["recovered_modulation_period_h"], "h"),
        ("nguyen_<3|14>", nguyen_result["passed"], nguyen_result["holo_modulation_peak_hz"], "Hz"),
        ("juan_fig4_monotonic", fig4_result["passed"], fig4_result["energy_ratio_beta1_to_beta0"], "ratio"),
        ("juan_fig5_monotonic", fig5_result["passed"], fig5_result["recovered_am_strengths"][-1] / max(fig5_result["recovered_am_strengths"][0], np.finfo(float).eps), "ratio"),
        ("juan_fig6_all_cells", fig6_result["passed"], min(fig6_result["target_cell_energies"].values()), "energy"),
    ]
    with (output_dir / "amfm_validation_table.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["case", "passed", "metric", "unit"])
        writer.writerows(rows)
    return _json_ready(results)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=Path("amfm_reproduction_output"))
    parser.add_argument("--no-figures", action="store_true")
    args = parser.parse_args()
    results = run_validation(args.out, make_figures=not args.no_figures)
    print(json.dumps(results, ensure_ascii=False, indent=2))
    return 0 if results["all_passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
