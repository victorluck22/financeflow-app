
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const categoryColors = {
  food: '#F97316',
  transport: '#3B82F6',
  entertainment: '#8B5CF6',
  shopping: '#10B981',
  health: '#EF4444',
  education: '#6366F1',
  bills: '#F59E0B',
  other: '#6B7280',
};

const categoryLabels = {
  food: 'Alimentação',
  transport: 'Transporte',
  entertainment: 'Entretenimento',
  shopping: 'Compras',
  health: 'Saúde',
  education: 'Educação',
  bills: 'Contas',
  other: 'Outros',
};

const CategoryChart = ({ categoryExpenses, currencySymbol = "R$" }) => {
  const data = Object.entries(categoryExpenses).map(([category, amount]) => ({
    name: categoryLabels[category] || category,
    value: amount,
    color: categoryColors[category] || '#6B7280',
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.color }}>
            {currencySymbol} {data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-slate-300">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-slate-400">Nenhuma despesa registrada</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
