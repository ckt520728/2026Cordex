"""論文代表性 AM-FM 模擬的回歸測試。"""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from reproduce_amfm_figures import run_validation


class TestAMFMReproduction(unittest.TestCase):
    """以預先定義的頻率位置與強度趨勢判定重現是否成功。"""

    @classmethod
    def setUpClass(cls) -> None:
        cls._temp_dir = tempfile.TemporaryDirectory()
        cls.results = run_validation(Path(cls._temp_dir.name), make_figures=False)

    @classmethod
    def tearDownClass(cls) -> None:
        cls._temp_dir.cleanup()

    def test_skill_ground_truth(self) -> None:
        self.assertTrue(self.results["skill_ground_truth"]["passed"])

    def test_nguyen_supplementary_figure_s1(self) -> None:
        self.assertTrue(self.results["nguyen_s1"]["passed"])

    def test_juan_figure_4_coupling_strength(self) -> None:
        self.assertTrue(self.results["juan_fig4"]["passed"])

    def test_juan_figure_5_time_varying_strength(self) -> None:
        self.assertTrue(self.results["juan_fig5"]["passed"])

    def test_juan_figure_6_multiple_patterns(self) -> None:
        self.assertTrue(self.results["juan_fig6"]["passed"])

    def test_global_hhsa_invariants(self) -> None:
        self.assertTrue(self.results["invariants"]["passed"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
