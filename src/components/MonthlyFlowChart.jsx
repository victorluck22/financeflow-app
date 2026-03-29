import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@/providers/ThemeProvider';

const MonthlyFlowChart = ({ transactions, currencySymbol = "R$" }) => {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(i, 1);
      return {
        month: date.toLocaleString('pt-BR', { month: 'short' }),
        receitas: 0,
        despesas: 0,
      };
    });

    transactions.forEach(t => {
      const monthIndex = new Date(t.date).getMonth();
      if (t.type === 'income') {
        months[monthIndex].receitas += t.amount;
      } else {
        months[monthIndex].despesas += t.amount;
      }
    });

    return months;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
          <p className="text-foreground font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {currencySymbol} {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB';

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="month" 
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${currencySymbol}${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar 
            dataKey="receitas" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            name="Receitas"
          />
          <Bar 
            dataKey="despesas" 
            fill="#EF4444" 
            radius={[4, 4, 0, 0]}
            name="Despesas"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyFlowChart;