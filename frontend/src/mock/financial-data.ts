/**
 * Mock financial data for visualization
 * This data structure matches the expected financial data interface used by visualization components
 */

export interface FinancialMetric {
  value: number | string;
  from?: string;
  to?: string;
}

export interface FinancialData {
  // Time periods for trend analysis
  periods: string[];
  // Cash flow from operating activities
  cashFlowOperating: number[];
  // Cash inflows by activity type
  cashInflows: {
    operatingActivities: number[];
    investingActivities: number[];
    financingActivities: number[];
  };
  // Cash outflows by activity type
  cashOutflows: {
    operatingActivities: number[];
    investingActivities: number[];
    financingActivities: number[];
  };
  // Net income component breakdown
  netIncomeComponents: {
    labels: string[];
    values: number[];
  };
  // Key financial metrics
  financialMetrics?: Record<string, FinancialMetric>;
}

/**
 * Mock data for a successful tech company
 */
export const techCompanyData: FinancialData = {
  periods: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024'],
  cashFlowOperating: [4500000, 5200000, 6100000, 6800000, 7500000],
  cashInflows: {
    operatingActivities: [8000000, 9500000, 11000000, 12500000, 14000000],
    investingActivities: [1000000, 1200000, 800000, 1500000, 2000000],
    financingActivities: [5000000, 3000000, 2000000, 1000000, 500000]
  },
  cashOutflows: {
    operatingActivities: [3500000, 4300000, 4900000, 5700000, 6500000],
    investingActivities: [4000000, 4500000, 5000000, 6000000, 7000000],
    financingActivities: [1000000, 1500000, 2000000, 2500000, 3000000]
  },
  netIncomeComponents: {
    labels: ['Net Income', 'Depreciation', 'Changes in Working Capital', 'Other Adjustments', 'Cash from Operations'],
    values: [6000000, 1500000, -500000, 500000, 7500000]
  },
  financialMetrics: {
    "Revenue": {
      "value": 14000000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Cost of Revenue": {
      "value": 5600000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Profit": {
      "value": 8400000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Research & Development": {
      "value": 2100000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Sales & Marketing": {
      "value": 1400000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "General & Administrative": {
      "value": 980000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Income": {
      "value": 3920000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Income": {
      "value": 3136000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "EPS": {
      "value": 2.45,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Margin": {
      "value": "28%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Profit Margin": {
      "value": "22.4%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    }
  }
};

/**
 * Mock data for a manufacturing company
 */
export const manufacturingCompanyData: FinancialData = {
  periods: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024'],
  cashFlowOperating: [2200000, 2600000, 2400000, 2900000, 3100000],
  cashInflows: {
    operatingActivities: [5000000, 5500000, 5200000, 6000000, 6500000],
    investingActivities: [200000, 300000, 250000, 400000, 350000],
    financingActivities: [1000000, 1500000, 2000000, 1200000, 800000]
  },
  cashOutflows: {
    operatingActivities: [2800000, 2900000, 2800000, 3100000, 3400000],
    investingActivities: [1500000, 2000000, 1800000, 2200000, 2500000],
    financingActivities: [800000, 700000, 900000, 1000000, 1200000]
  },
  netIncomeComponents: {
    labels: ['Net Income', 'Depreciation', 'Changes in Working Capital', 'Other Adjustments', 'Cash from Operations'],
    values: [2000000, 1200000, -300000, 200000, 3100000]
  },
  financialMetrics: {
    "Revenue": {
      "value": 6500000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Cost of Goods Sold": {
      "value": 3900000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Profit": {
      "value": 2600000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Expenses": {
      "value": 1560000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Income": {
      "value": 1040000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Income": {
      "value": 832000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Inventory Turnover": {
      "value": 4.8,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Margin": {
      "value": "40%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Margin": {
      "value": "16%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Profit Margin": {
      "value": "12.8%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    }
  }
};

/**
 * Mock data for a retail company
 */
export const retailCompanyData: FinancialData = {
  periods: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024'],
  cashFlowOperating: [1800000, 1600000, 2100000, 3200000, 2200000],
  cashInflows: {
    operatingActivities: [7500000, 7000000, 8000000, 12000000, 8500000],
    investingActivities: [100000, 150000, 200000, 300000, 250000],
    financingActivities: [500000, 600000, 700000, 800000, 600000]
  },
  cashOutflows: {
    operatingActivities: [5700000, 5400000, 5900000, 8800000, 6300000],
    investingActivities: [800000, 900000, 1000000, 1200000, 1100000],
    financingActivities: [600000, 700000, 800000, 900000, 750000]
  },
  netIncomeComponents: {
    labels: ['Net Income', 'Depreciation', 'Changes in Working Capital', 'Other Adjustments', 'Cash from Operations'],
    values: [1500000, 500000, 100000, 100000, 2200000]
  },
  financialMetrics: {
    "Revenue": {
      "value": 8500000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Cost of Goods Sold": {
      "value": 5950000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Profit": {
      "value": 2550000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Expenses": {
      "value": 1700000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Income": {
      "value": 850000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Income": {
      "value": 680000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Same Store Sales Growth": {
      "value": "4.2%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Inventory Turnover": {
      "value": 6.5,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Margin": {
      "value": "30%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Margin": {
      "value": "10%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    }
  }
};

/**
 * Mock data collection export
 */
export const mockFinancialData = {
  techCompany: techCompanyData,
  manufacturingCompany: manufacturingCompanyData,
  retailCompany: retailCompanyData
};

export default mockFinancialData;
