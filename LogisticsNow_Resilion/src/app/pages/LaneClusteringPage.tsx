import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import Map from "../components/Map";
import { Sparkles, TrendingUp, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from "recharts";

// Updated lane data with Indian cities (FALLBACK ONLY)
const fallbackLaneData = [
  {
    id: "LN-001",
    origin: "Mumbai, MH",
    destination: "Delhi, DL",
    volume: 3245,
    avgRate: "₹48,500",
    trend: "+8%",
    trendUp: true,
  },
  {
    id: "LN-002",
    origin: "Delhi, DL",
    destination: "Bengaluru, KA",
    volume: 2890,
    avgRate: "₹52,300",
    trend: "+12%",
    trendUp: true,
  },
  {
    id: "LN-003",
    origin: "Mumbai, MH",
    destination: "Bengaluru, KA",
    volume: 2650,
    avgRate: "₹38,200",
    trend: "+5%",
    trendUp: true,
  },
  {
    id: "LN-004",
    origin: "Chennai, TN",
    destination: "Mumbai, MH",
    volume: 2340,
    avgRate: "₹42,800",
    trend: "-2%",
    trendUp: false,
  },
  {
    id: "LN-005",
    origin: "Kolkata, WB",
    destination: "Delhi, DL",
    volume: 2180,
    avgRate: "₹45,600",
    trend: "+15%",
    trendUp: true,
  },
  {
    id: "LN-006",
    origin: "Hyderabad, TS",
    destination: "Bengaluru, KA",
    volume: 1960,
    avgRate: "₹28,900",
    trend: "+3%",
    trendUp: true,
  },
  {
    id: "LN-007",
    origin: "Pune, MH",
    destination: "Mumbai, MH",
    volume: 1850,
    avgRate: "₹12,500",
    trend: "+10%",
    trendUp: true,
  },
];

// Updated cost per lane data with Indian routes (FALLBACK ONLY)
const fallbackCostPerLaneData = [
  { lane: "Mumbai → Delhi", rate: 48500 },
  { lane: "Delhi → Bengaluru", rate: 52300 },
  { lane: "Mumbai → Bengaluru", rate: 38200 },
  { lane: "Chennai → Mumbai", rate: 42800 },
  { lane: "Kolkata → Delhi", rate: 45600 },
  { lane: "Hyderabad → Bengaluru", rate: 28900 },
  { lane: "Pune → Mumbai", rate: 12500 },
];

export function LaneClusteringPage() {
  const [loading, setLoading] = useState(false);
  const [laneAnalysisData, setLaneAnalysisData] = useState<any>(null);

  // ✅ STEP 2 — Fixed mapping from backend to UI
  useEffect(() => {
    const stored = sessionStorage.getItem("laneAnalysisResults");

    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("✅ Raw Backend Data:", parsed);

      setLaneAnalysisData({
        totalLanes: parsed.lane_intelligence?.unique_lanes || 0,
        highVolumeLanes: parsed.lane_intelligence?.high_priority_lanes || 0,
        avgLaneVolume: parsed.efficiency_metrics?.shipments_processed || 0,
        coverageArea: parsed.lane_intelligence?.unique_lanes || 28,

        topLanes: parsed.lane_intelligence?.lane_summary?.map((lane: any, index: number) => ({
          id: `LN-${String(index + 1).padStart(3, '0')}`,
          origin: lane.lane_id.split("_")[0] || "Unknown",
          destination: lane.lane_id.split("_")[1] || "Unknown",
          volume: lane.lane_volume || 0,
          avgRate: `₹${lane.avg_actual_rate?.toFixed(0) || '0'}`,
          trend: `${lane.savings_percentage?.toFixed(1) || '0'}%`,
          trendUp: (lane.savings_percentage || 0) > 0
        })) || [],

        costPerLane: parsed.lane_intelligence?.lane_summary?.map((lane: any) => ({
          lane: lane.lane_id.replaceAll("_", " → "),
          rate: lane.avg_actual_rate || lane.avg_predicted_rate || 0
        })) || []
      });
    } else {
      console.log("⚠️ No lane analysis results found, using fallback data");
    }
  }, []);

  const handleGenerateInsights = () => {
    setLoading(true);
    // Simulate generating insights
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  // Use transformed data or fallback
  const displayTopLanes = laneAnalysisData?.topLanes || fallbackLaneData;
  const displayCostPerLane = laneAnalysisData?.costPerLane || fallbackCostPerLaneData;
  const maxRate = Math.max(...displayCostPerLane.map((d: any) => d.rate));

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Lane Clustering - India</h1>
          <p className="text-muted-foreground">
            AI-identified transportation lanes and patterns across India
          </p>
          {laneAnalysisData && (
            <p className="text-xs text-secondary mt-1">
              Analysis based on real ML processing
            </p>
          )}
        </div>

        <Button 
          className="bg-secondary hover:bg-secondary/90"
          onClick={handleGenerateInsights}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Lane Insights
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards - Using Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Lanes</p>
          <h2 className="text-3xl text-primary mb-2">
            {laneAnalysisData?.totalLanes || 342}
          </h2>
          <p className="text-sm text-secondary">AI-detected routes</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">High Priority Lanes</p>
          <h2 className="text-3xl text-primary mb-2">
            {laneAnalysisData?.highVolumeLanes || 87}
          </h2>
          <p className="text-sm text-muted-foreground">Negotiation required</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Shipments Processed</p>
          <h2 className="text-3xl text-primary mb-2">
            {(laneAnalysisData?.avgLaneVolume || 124589).toLocaleString()}
          </h2>
          <p className="text-sm text-muted-foreground">total shipments</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Coverage Area</p>
          <h2 className="text-3xl text-primary mb-2">
            {laneAnalysisData?.coverageArea || 28}
          </h2>
          <p className="text-sm text-muted-foreground">unique lanes</p>
        </Card>
      </div>

      {/* Google Map */}
      <Card className="p-6">
        <h3 className="mb-4">Indian Transportation Network Map</h3>
        <Map />
      </Card>

      {/* Top Transportation Lanes Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Top Transportation Lanes - India</h3>
          <span className="text-sm text-muted-foreground">
            Showing {displayTopLanes.length} of {laneAnalysisData?.totalLanes || 342} lanes
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lane ID</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Shipment Volume</TableHead>
                <TableHead>Avg. Freight Rate</TableHead>
                <TableHead>Savings Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTopLanes.map((lane: any, index: number) => (
                <TableRow key={lane.id || index}>
                  <TableCell>
                    <Badge variant="outline">{lane.id || `LN-${String(index + 1).padStart(3, '0')}`}</Badge>
                  </TableCell>
                  <TableCell>{lane.origin || 'Unknown'}</TableCell>
                  <TableCell>{lane.destination || 'Unknown'}</TableCell>
                  <TableCell>{(lane.volume || 0).toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-secondary">
                    {lane.avgRate || '₹0'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        lane.trendUp ? "text-secondary" : "text-destructive"
                      }`}
                    >
                      <TrendingUp
                        className={`w-4 h-4 ${!lane.trendUp ? "rotate-180" : ""}`}
                      />
                      {lane.trend || '0%'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Cost per Lane Analysis */}
      <Card className="p-6">
        <h3>Cost per Lane Analysis - India</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Average freight rate across the most active Indian transportation lanes
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={displayCostPerLane}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="lane" stroke="#666" />
            <YAxis stroke="#666" tickFormatter={(value) => `₹${(value/1000)}K`} />
            <Tooltip 
              formatter={(value) => [`₹${value.toLocaleString()}`, "Avg. Rate"]}
              labelFormatter={(label) => `Lane: ${label}`}
            />
            <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
              {displayCostPerLane.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.rate === maxRate ? "#E74C3C" : "#1ABC9C"}
                />
              ))}
              <LabelList
                dataKey="rate"
                position="top"
                formatter={(value: number) => `₹${(value/1000).toFixed(1)}K`}
                style={{ fill: "#333", fontSize: 12, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}