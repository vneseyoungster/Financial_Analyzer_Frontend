import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FinancialData {
  // This would be replaced with actual data structure from your backend
  periods: string[];
  cashFlowOperating: number[];
  cashInflows: {
    operatingActivities: number[];
    investingActivities: number[];
    financingActivities: number[];
  };
  cashOutflows: {
    operatingActivities: number[];
    investingActivities: number[];
    financingActivities: number[];
  };
  netIncomeComponents: {
    labels: string[];
    values: number[];
  };
  // New financial metrics that match the provided JSON structure
  financialMetrics?: Record<string, {
    value: number | string;
    from?: string;
    to?: string;
  }>;
}

interface FinancialChartsProps {
  data?: FinancialData;
  loading: boolean;
}

// Sample data for demonstration
const sampleData: FinancialData = {
  periods: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
  cashFlowOperating: [120000, 135000, 150000, 142000, 160000],
  cashInflows: {
    operatingActivities: [200000, 220000, 240000, 230000, 250000],
    investingActivities: [50000, 30000, 40000, 60000, 45000],
    financingActivities: [80000, 90000, 70000, 85000, 95000]
  },
  cashOutflows: {
    operatingActivities: [80000, 85000, 90000, 88000, 90000],
    investingActivities: [70000, 65000, 75000, 80000, 85000],
    financingActivities: [60000, 70000, 65000, 75000, 80000]
  },
  netIncomeComponents: {
    labels: ['Net Income', 'Depreciation', 'Changes in Working Capital', 'Other Adjustments', 'Cash from Operations'],
    values: [100000, 30000, -15000, 45000, 160000]
  },
  // Sample financial metrics data
  financialMetrics: {
    "Revenue": {
      "value": 15383073,
      "from": "2023-01-01",
      "to": "2023-03-31"
    },
    "Cost": {
      "value": 6490407,
      "from": "2023-01-01",
      "to": "2023-03-31"
    },
    "Gross Profit": {
      "value": 8883606,
      "from": "2023-01-01",
      "to": "2023-03-31"
    },
    "Operating Expenses": {
      "value": 4493916,
      "from": "2023-01-01",
      "to": "2023-03-31"
    },
    "Operating Income": {
      "value": 4399690,
      "from": "2023-01-01",
      "to": "2023-03-31"
    },
    "Net Income": {
      "value": 5307315,
      "from": "2023-01-01",
      "to": "2023-03-31"
    }
  }
};

const FinancialCharts: React.FC<FinancialChartsProps> = ({ data = sampleData, loading }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Line chart for financial metrics
  const createFinancialMetricsLineChart = () => {
    // If no financial metrics data is available, return empty data
    if (!data.financialMetrics || Object.keys(data.financialMetrics).length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Get the metrics we want to display in the line chart
    const keyMetrics = [
      'Revenue', 
      'Cost', 
      'Gross Profit', 
      'Operating Expenses', 
      'Operating Income', 
      'Net Income'
    ];

    // Filter to include only the metrics we have data for
    const availableMetrics = keyMetrics.filter(metric => 
      data.financialMetrics && data.financialMetrics[metric]
    );

    // Chart colors (add more if needed)
    const colors = [
      { border: 'rgb(53, 162, 235)', background: 'rgba(53, 162, 235, 0.2)' },
      { border: 'rgb(255, 99, 132)', background: 'rgba(255, 99, 132, 0.2)' },
      { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.2)' },
      { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.2)' },
      { border: 'rgb(153, 102, 255)', background: 'rgba(153, 102, 255, 0.2)' },
      { border: 'rgb(255, 205, 86)', background: 'rgba(255, 205, 86, 0.2)' },
    ];

    // Get time period from the first metric
    const firstMetric = data.financialMetrics[availableMetrics[0]];
    let timePeriod = 'Q1 2023';
    if (firstMetric && firstMetric.from && firstMetric.to) {
      const fromDate = new Date(firstMetric.from);
      // Extract quarter information from the date
      const quarter = Math.floor(fromDate.getMonth() / 3) + 1;
      const year = fromDate.getFullYear();
      timePeriod = `Q${quarter} ${year}`;
    }

    // For a better visualization, we'll create simulated data for 4 quarters
    // In a real application, you would replace this with actual historical data
    const periods = [`Q1 ${new Date().getFullYear()-1}`, `Q2 ${new Date().getFullYear()-1}`, 
                     `Q3 ${new Date().getFullYear()-1}`, `Q4 ${new Date().getFullYear()-1}`, 
                     timePeriod];

    // Create datasets for each metric with simulated historic data
    const datasets = availableMetrics.map((metric, index) => {
      const colorIndex = index % colors.length;
      const currentValue = data.financialMetrics![metric].value;
      
      // Generate simulated historic data (slightly lower values for previous quarters)
      // This creates a general upward trend
      const generateHistoricalData = () => {
        const fluctuationFactor = 0.85 + Math.random() * 0.15; // Random factor between 0.85 and 1.0
        const metricValue = typeof currentValue === 'string' ? parseFloat(currentValue.toString()) : currentValue;
        
        if (isNaN(metricValue)) {
          return [0, 0, 0, 0, 0]; // Return zeros if the value is not a valid number
        }
        
        return [
          metricValue * 0.7 * fluctuationFactor, // Q1 previous year
          metricValue * 0.75 * fluctuationFactor, // Q2 previous year
          metricValue * 0.85 * fluctuationFactor, // Q3 previous year
          metricValue * 0.95 * fluctuationFactor, // Q4 previous year
          metricValue // Current quarter
        ];
      };
      
      return {
        label: metric,
        data: generateHistoricalData(),
        borderColor: colors[colorIndex].border,
        backgroundColor: colors[colorIndex].background,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    return {
      labels: periods,
      datasets
    };
  };

  const financialMetricsOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Financial Performance Metrics',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Amount ($)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(value as number);
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  // Line chart for Cash Flow from Operating Activities
  const lineChartData = {
    labels: data.periods,
    datasets: [
      {
        label: 'Cash Flow from Operating Activities',
        data: data.cashFlowOperating,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Cash Flow from Operating Activities Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };

  // Stacked area chart for cash inflows and outflows
  const stackedAreaData = {
    labels: data.periods,
    datasets: [
      {
        label: 'Operating Inflows',
        data: data.cashInflows.operatingActivities,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        fill: true,
      },
      {
        label: 'Investing Inflows',
        data: data.cashInflows.investingActivities,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        fill: true,
      },
      {
        label: 'Financing Inflows',
        data: data.cashInflows.financingActivities,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgb(153, 102, 255)',
        fill: true,
      },
      {
        label: 'Operating Outflows',
        data: data.cashOutflows.operatingActivities.map(val => -val),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        fill: true,
      },
      {
        label: 'Investing Outflows',
        data: data.cashOutflows.investingActivities.map(val => -val),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgb(255, 159, 64)',
        fill: true,
      },
      {
        label: 'Financing Outflows',
        data: data.cashOutflows.financingActivities.map(val => -val),
        backgroundColor: 'rgba(255, 205, 86, 0.6)',
        borderColor: 'rgb(255, 205, 86)',
        fill: true,
      },
    ],
  };

  const stackedAreaOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Cash Inflows and Outflows',
      },
    },
    scales: {
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Period'
        }
      }
    }
  };

  // Waterfall chart for cash components
  const createWaterfallData = () => {
    const { labels, values } = data.netIncomeComponents;
    
    const backgroundColors = values.map((value, index) => {
      if (index === 0) return 'rgba(54, 162, 235, 0.6)'; // Start (Net Income)
      if (index === values.length - 1) return 'rgba(75, 192, 192, 0.6)'; // End (Cash from Operations)
      return value >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'; // Positive or negative
    });

    return {
      labels,
      datasets: [
        {
          label: 'Amount',
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
          borderWidth: 1
        }
      ]
    };
  };

  const waterfallOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Cash Flow Components Breakdown',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };

  // Create financial metrics line chart data
  const financialMetricsLineData = createFinancialMetricsLineChart();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="financial chart tabs">
          <Tab label="Financial Metrics" />
          <Tab label="Cash Flow Trend" />
          <Tab label="Cash Flow Components" />
          <Tab label="Income Breakdown" />
        </Tabs>
      </Box>

      {/* Financial Metrics Line Chart */}
      {tabValue === 0 && (
        <Box sx={{ height: 400, position: 'relative' }}>
          {financialMetricsLineData.datasets.length > 0 ? (
            <Line data={financialMetricsLineData} options={financialMetricsOptions} />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                No financial metrics data available
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Cash Flow Trend */}
      {tabValue === 1 && (
        <Box sx={{ height: 400, position: 'relative' }}>
          <Line data={lineChartData} options={lineChartOptions} />
        </Box>
      )}

      {/* Cash Inflows and Outflows */}
      {tabValue === 2 && (
        <Box sx={{ height: 400, position: 'relative' }}>
          <Line data={stackedAreaData} options={stackedAreaOptions} />
        </Box>
      )}

      {/* Cash Flow Components */}
      {tabValue === 3 && (
        <Box sx={{ height: 400, position: 'relative' }}>
          <Bar data={createWaterfallData()} options={waterfallOptions} />
        </Box>
      )}
    </Paper>
  );
};

export default FinancialCharts; 