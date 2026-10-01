import { useState } from 'react';
import Plot from 'react-plotly.js';
import type { StationModelComparison } from '../types/comparison';

interface ModelProfileChartProps {
  comparison: StationModelComparison;
}

type ChartVariable = 'temperature' | 'salinity' | 'currentSpeed';

export default function ModelProfileChart({ comparison }: ModelProfileChartProps) {
  const [activeVar, setActiveVar] = useState<ChartVariable>('temperature');

  const variableData = comparison[activeVar];

  const observedDepths = variableData.observed.map(d => d.depthM);
  const observedValues = variableData.observed.map(d => d.value);

  const modelDepths = variableData.model.map(d => d.depthM);
  const modelValues = variableData.model.map(d => d.value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Vertical Profile</h4>
        <div className="flex bg-slate-800 rounded border border-slate-700 overflow-hidden">
          <button 
            type="button"
            aria-pressed={activeVar === 'temperature'}
            aria-label="Show temperature profile"
            title="Show temperature profile"
            className={`px-2 py-1 text-[10px] font-semibold transition-colors ${activeVar === 'temperature' ? 'bg-ocean-accent text-ocean-dark' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
            onClick={() => setActiveVar('temperature')}
          >
            Temp
          </button>
          <button 
            type="button"
            aria-pressed={activeVar === 'salinity'}
            aria-label="Show salinity profile"
            title="Show salinity profile"
            className={`px-2 py-1 text-[10px] font-semibold transition-colors ${activeVar === 'salinity' ? 'bg-ocean-accent text-ocean-dark' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
            onClick={() => setActiveVar('salinity')}
          >
            Salinity
          </button>
          <button 
            type="button"
            aria-pressed={activeVar === 'currentSpeed'}
            aria-label="Show current speed profile"
            title="Show current speed profile"
            className={`px-2 py-1 text-[10px] font-semibold transition-colors ${activeVar === 'currentSpeed' ? 'bg-ocean-accent text-ocean-dark' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
            onClick={() => setActiveVar('currentSpeed')}
          >
            Speed
          </button>
        </div>
      </div>
      
      <div className="h-[280px] w-full bg-[#030b14] rounded border border-slate-800 p-1 relative">
        <Plot
          data={[
            {
              x: observedValues,
              y: observedDepths,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Observed',
              line: { color: '#06b6d4', width: 3 }, // solid cyan
              marker: { color: '#06b6d4', size: 6 },
              hovertemplate: `%{y} m<br><b>Observed:</b> %{x} ${variableData.unit}<extra></extra>`
            },
            {
              x: modelValues,
              y: modelDepths,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Model',
              line: { color: '#f97316', width: 3, dash: 'dash' }, // orange dashed
              marker: { color: '#f97316', size: 6 },
              hovertemplate: `%{y} m<br><b>Model:</b> %{x} ${variableData.unit}<extra></extra>`
            }
          ]}
          layout={{
            autosize: true,
            margin: { l: 40, r: 10, t: 10, b: 35 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#94a3b8', size: 10 },
            xaxis: {
              title: { text: `Value (${variableData.unit})`, font: { size: 10 } },
              gridcolor: 'rgba(51, 65, 85, 0.4)',
              zerolinecolor: 'rgba(51, 65, 85, 0.4)'
            },
            yaxis: {
              title: { text: 'Depth (m)', font: { size: 10 } },
              autorange: 'reversed', // depth increases downward
              gridcolor: 'rgba(51, 65, 85, 0.4)',
              zerolinecolor: 'rgba(51, 65, 85, 0.4)'
            },
            legend: {
              orientation: 'h',
              y: -0.2,
              x: 0.5,
              xanchor: 'center',
              font: { color: '#cbd5e1' }
            },
            hovermode: 'closest'
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Accessible text for screen readers */}
        <div className="sr-only">
          Observed and model {activeVar} profiles at depths 0, 50, 100, and 200 metres.
        </div>
      </div>
      
      <div className="text-center text-xs text-slate-400 font-medium">
        Mean Absolute Error (MAE): <span className="text-slate-200">{variableData.mae} {variableData.unit}</span>
      </div>
    </div>
  );
}
