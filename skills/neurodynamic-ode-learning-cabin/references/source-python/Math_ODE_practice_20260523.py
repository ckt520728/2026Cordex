import numpy as np
import matplotlib.pyplot as plt

# 1. 設定參數
tau = 10.0      # 膜時間常數 (ms)
V_rest = -70.0  # 靜息電位 (mV)
V_th = -55.0    # 閾值 (mV)
V_reset = -75.0 # 重置電位 (mV)
R = 1.0         # 膜電阻
I_ext = 16.0    # 輸入電流

# 2. 設定時間軸 (Euler Method 需要切分極小的時間間隔 dt)
dt = 0.1
t = np.arange(0, 100, dt)
V = np.zeros(len(t))
V[0] = V_rest   # 初始條件 (Initial Condition)

# 3. 數值積分 (解 ODE 的核心迴圈)
for i in range(1, len(t)):
    # 計算 dV/dt (微分方程式本體)
    dVdt = (-(V[i-1] - V_rest) + R * I_ext) / tau
    
    # 更新 V (Euler Method: 新值 = 舊值 + 變化率 * 時間差)
    V[i] = V[i-1] + dVdt * dt
    
    # 檢查是否達到閾值 (Spike 條件)
    if V[i] >= V_th:
        V[i] = V_reset # 發放動作電位後重置

# 4. 畫圖視覺化
plt.figure(figsize=(10, 4))
plt.plot(t, V, label='Membrane Potential V(t)')
plt.axhline(V_th, color='r', linestyle='--', label='Threshold')
plt.xlabel('Time (ms)')
plt.ylabel('Voltage (mV)')
plt.title('Leaky Integrate-and-Fire (LIF) Neuron')
plt.legend()
plt.show()