import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, TrendingUp, ArrowRight } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const inconsistencyData = [
  { category: "Location", issues: 2340, severity: "medium" },
  { category: "Equipment", issues: 1456, severity: "low" },
  { category: "Weight", issues: 892, severity: "high" },
  { category: "Dates", issues: 567, severity: "medium" },
  { category: "Carrier", issues: 234, severity: "low" },
];

const duplicateDetection = [
  { name: "Exact Duplicates", value: 4234, color: "#d4183d" },
  { name: "Fuzzy Matches", value: 2121, color: "#e74c3c" },
  { name: "Unique Records", value: 118234, color: "#1ABC9C" },
];

const normalizationResults = [
  { month: "Jan", normalized: 3800, errors: 200 },
  { month: "Feb", normalized: 3400, errors: 150 },
  { month: "Mar", normalized: 4800, errors: 120 },
  { month: "Apr", normalized: 4300, errors: 90 },
  { month: "May", normalized: 5500, errors: 65 },
  { month: "Jun", normalized: 5900, errors: 45 },
];

const aiInsights = [
  {
    id: 1,
    type: "optimization",
    title: "Carrier Name Standardization",
    description: "Identified 23 variations of 'Federal Express' and standardized to 'FedEx'",
    impact: "high",
  },
  {
    id: 2,
    type: "warning",
    title: "Missing Weight Data",
    description: "892 records missing weight information. Consider data enrichment.",
    impact: "medium",
  },
  {
    id: 3,
    type: "success",
    title: "Location Accuracy Improved",
    description: "Normalized 2,340 location entries to standard USPS format",
    impact: "high",
  },
  {
    id: 4,
    type: "optimization",
    title: "Date Format Consistency",
    description: "Converted all dates to ISO 8601 format for better processing",
    impact: "medium",
  },
];

export function DataQualityPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Data Quality Analytics</h1>
        <p className="text-muted-foreground">
          AI-powered data quality insights and recommendations
        </p>
      </div>

      {/* Quality Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-secondary/5 border-secondary">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Overall Quality Score</p>
            <CheckCircle2 className="w-5 h-5 text-secondary" />
          </div>
          <h1 className="text-5xl text-secondary mb-2">94.9%</h1>
          <p className="text-sm text-muted-foreground">+3.2% from last dataset</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Issues Detected</p>
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-4xl text-primary mb-2">5,489</h2>
          <p className="text-sm text-muted-foreground">Across 5 categories</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Auto-Fixed</p>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <h2 className="text-4xl text-secondary mb-2">5,134</h2>
          <p className="text-sm text-muted-foreground">93.5% resolution rate</p>
        </Card>
      </div>

      {/* New Data Quality Improvement Section - Clean Two-Card Layout */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3>Data Quality Improvement</h3>
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            +16.9% improvement
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Comparison of dataset quality before and after automated cleaning
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Card */}
          <div className="bg-muted/30 rounded-lg p-6 text-center border border-border">
            <p className="text-sm text-muted-foreground mb-3">Before Cleaning</p>
            <div className="text-6xl font-light text-muted-foreground mb-2">78%</div>
            <div className="w-16 h-1 bg-muted-foreground/20 rounded-full mx-auto"></div>
            <p className="text-xs text-muted-foreground mt-3">Raw dataset quality</p>
          </div>

          {/* After Card */}
          <div className="bg-secondary/5 rounded-lg p-6 text-center border border-secondary/20">
            <p className="text-sm text-secondary mb-3">After Cleaning</p>
            <div className="text-6xl font-bold text-secondary mb-2">94.9%</div>
            <div className="w-16 h-1 bg-secondary/30 rounded-full mx-auto"></div>
            <p className="text-xs text-secondary mt-3">AI-enhanced quality</p>
          </div>
        </div>

        {/* Progress Comparison */}
        <div className="mt-8 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quality Score Comparison</span>
            <span className="text-secondary font-medium">94.9%</span>
          </div>
          
          {/* Double progress bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="relative h-full">
              {/* Before bar (gray) */}
              <div 
                className="absolute top-0 left-0 h-full bg-muted-foreground/30 rounded-full"
                style={{ width: '78%' }}
              />
              {/* After bar (green) */}
              <div 
                className="absolute top-0 left-0 h-full bg-secondary rounded-full"
                style={{ width: '94.9%' }}
              />
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Before: 78%</span>
            <span className="text-secondary font-medium">After: 94.9%</span>
          </div>
        </div>

        {/* Impact Message */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">AI cleaning engine impact:</span>
            </div>
            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                +16.9 percentage points
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4">Data Inconsistency Detection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inconsistencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="category" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Bar dataKey="issues" fill="#0B3C5D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Duplicate Shipment Detection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={duplicateDetection}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {duplicateDetection.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4">Location Normalization Results</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={normalizationResults}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="normalized"
              stroke="#1ABC9C"
              strokeWidth={2}
              dot={{ fill: "#1ABC9C", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="errors"
              stroke="#d4183d"
              strokeWidth={2}
              dot={{ fill: "#d4183d", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* AI Insights Panel */}
      <Card className="p-6">
        <h3 className="mb-4">AI Insights & Recommendations</h3>
        <div className="space-y-4">
          {aiInsights.map((insight) => {
            const Icon =
              insight.type === "success"
                ? CheckCircle2
                : insight.type === "warning"
                ? AlertCircle
                : XCircle;
            const iconColor =
              insight.type === "success"
                ? "text-secondary"
                : insight.type === "warning"
                ? "text-primary"
                : "text-destructive";

            return (
              <div
                key={insight.id}
                className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
              >
                <Icon className={`w-5 h-5 mt-0.5 ${iconColor}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm">{insight.title}</h4>
                    <Badge
                      variant="outline"
                      className={
                        insight.impact === "high"
                          ? "border-secondary text-secondary"
                          : ""
                      }
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}