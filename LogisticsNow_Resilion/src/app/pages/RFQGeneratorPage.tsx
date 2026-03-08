import { useState, useMemo, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { 
  Download, 
  FileText, 
  Filter, 
  Eye, 
  FileSpreadsheet,
  FileJson,
  ChevronUp, 
  ChevronDown,
  X 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

// Helper function to get carrier initials and color (kept for fallback)
const getCarrierInfo = (carrier: string) => {
  const carriers: Record<string, { initials: string; color: string }> = {
    'FedEx': { initials: 'FE', color: '#4D148C' },
    'UPS': { initials: 'UP', color: '#351C15' },
    'XPO': { initials: 'XP', color: '#E35205' },
    'JB Hunt': { initials: 'JH', color: '#006341' },
    'Schneider': { initials: 'SC', color: '#FDB913' },
  };
  return carriers[carrier] || { initials: carrier.substring(0, 2).toUpperCase(), color: '#64748b' };
};

// Helper function to get equipment badge color
const getEquipmentColor = (equipment: string) => {
  const eq = equipment.toLowerCase();
  if (eq.includes('ftl') || eq.includes('full')) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
  if (eq.includes('ltl')) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
  if (eq.includes('reefer') || eq.includes('refrigerated')) return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300';
  if (eq.includes('flatbed')) return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300';
  return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
};

// Helper function to get volume color class
const getVolumeColorClass = (volume: number) => {
  if (volume > 2000) return 'bg-red-50 dark:bg-red-950/20';
  if (volume > 1000) return 'bg-yellow-50 dark:bg-yellow-950/20';
  return 'bg-green-50 dark:bg-green-950/20';
};

export function RFQGeneratorPage() {
  const [data, setData] = useState<any[]>([]);
  const [carrier, setCarrier] = useState("");
  const [equipment, setEquipment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // 🔥 FIXED: Volume range now starts at 0 to show all lanes
  const [volumeRange, setVolumeRange] = useState<[number, number]>([0, 100000]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load real data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("laneAnalysisResults");

    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("✅ RFQ Page loading data from:", parsed);

      const rfq = parsed?.lane_intelligence?.rfq_recommendations || [];

      const transformed = rfq.map((lane: any, index: number) => {
        // Find matching lane in lane_summary to get volume
        const matchingLane = parsed?.lane_intelligence?.lane_summary?.find(
          (l: any) => l.lane_id === lane.lane_id
        );

        // 🔥 FIXED: Parse lane_id to extract all components
        const parts = lane.lane_id.toLowerCase().split("_");
        
        const origin = parts[0] || "Unknown";
        const destination = parts[1] || "Unknown";
        const equipmentType = parts[2] || "Unknown";
        const serviceLevel = parts[3] || "Unknown";

        return {
          id: index.toString(),
          laneId: lane.lane_id,
          origin,
          destination,
          volume: matchingLane?.lane_volume || 1,
          carrier: matchingLane?.carrier_name || "Unknown",
          service: serviceLevel,
          equipment: equipmentType,
          rate: lane.recommended_rate || 0,
          trend: `${lane.savings_percentage?.toFixed(2)}%`,
          trendUp: lane.savings_percentage > 0,
          selected: false,
        };
      });

      console.log("✅ Transformed RFQ data:", transformed);
      setData(transformed);
    } else {
      console.log("⚠️ No lane analysis results found");
    }
  }, []);

  // Filter data based on text inputs
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Carrier filter (case-insensitive partial match)
      if (carrier) {
        if (!item.carrier.toLowerCase().includes(carrier.toLowerCase())) return false;
      }
      
      // Equipment filter (case-insensitive partial match)
      if (equipment) {
        if (!item.equipment.toLowerCase().includes(equipment.toLowerCase())) return false;
      }
      
      // Volume range filter
      if (item.volume < volumeRange[0] || item.volume > volumeRange[1]) return false;
      
      // Search query (searches across multiple fields)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.laneId.toLowerCase().includes(query) ||
          item.origin.toLowerCase().includes(query) ||
          item.destination.toLowerCase().includes(query) ||
          item.carrier.toLowerCase().includes(query) ||
          item.equipment.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [data, carrier, equipment, volumeRange, searchQuery]);

  // Selection handling
  const selectedItems = useMemo(() => 
    filteredData.filter(item => item.selected), [filteredData]
  );
  
  const selectedCount = selectedItems.length;
  const allFilteredSelected = filteredData.length > 0 && 
    filteredData.every(item => item.selected);

  // Selection summary calculations
  const totalVolume = selectedItems.reduce((sum, item) => sum + item.volume, 0);
  const totalCost = selectedItems.reduce((sum, item) => sum + (item.rate * item.volume), 0);
  const uniqueCarriersCount = new Set(selectedItems.map(item => item.carrier)).size;

  const toggleSelection = (id: string) => {
    setData(data.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered items
      setData(data.map(item => 
        filteredData.some(f => f.id === item.id) 
          ? { ...item, selected: false } 
          : item
      ));
    } else {
      // Select all filtered items
      setData(data.map(item => 
        filteredData.some(f => f.id === item.id) 
          ? { ...item, selected: true } 
          : item
      ));
    }
  };

  const clearSelection = () => {
    setData(data.map((item) => ({ ...item, selected: false })));
  };

  const resetFilters = () => {
    setCarrier("");
    setEquipment("");
    setSearchQuery("");
    // 🔥 FIXED: Reset to show all lanes
    setVolumeRange([0, 100000]);
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['Lane ID', 'Origin', 'Destination', 'Volume', 'Carrier', 'Service Level', 'Equipment', 'Recommended Rate'];
    const csvData = (selectedCount > 0 ? selectedItems : filteredData).map(item => [
      item.laneId,
      item.origin,
      item.destination,
      item.volume,
      item.carrier,
      item.service,
      item.equipment,
      item.rate
    ]);
    
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rfq-lanes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generatePDF = () => {
    alert(`Generating PDF RFQ for ${selectedCount > 0 ? selectedCount : filteredData.length} lanes`);
  };

  // Check if any filters are active
  const hasActiveFilters = carrier || equipment || searchQuery || volumeRange[0] !== 0 || volumeRange[1] !== 100000;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>RFQ Dataset Generator</h1>
          <p className="text-muted-foreground">
            Generate procurement-ready datasets for carrier RFQs
          </p>
          {data.length === 0 && (
            <p className="text-xs text-yellow-600 mt-1">
              ⚠️ No RFQ data found. Please run lane analysis first.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>RFQ Preview</DialogTitle>
                <DialogDescription>
                  Review the selected lanes before generating the final RFQ
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Selected Lanes</p>
                    <p className="text-2xl font-bold">{selectedCount || filteredData.length}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold">{(selectedCount > 0 ? totalVolume : filteredData.reduce((sum, i) => sum + i.volume, 0)).toLocaleString()}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Est. Total Cost</p>
                    <p className="text-2xl font-bold">${(selectedCount > 0 ? totalCost : filteredData.reduce((sum, i) => sum + (i.rate * i.volume), 0)).toLocaleString()}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Unique Carriers</p>
                    <p className="text-2xl font-bold">{selectedCount > 0 ? uniqueCarriersCount : new Set(filteredData.map(i => i.carrier)).size}</p>
                  </Card>
                </div>
                <div className="border rounded-lg p-4 max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lane ID</TableHead>
                        <TableHead>Origin → Destination</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Carrier</TableHead>
                        <TableHead>Recommended Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedCount > 0 ? selectedItems : filteredData).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.laneId}</TableCell>
                          <TableCell>{item.origin} → {item.destination}</TableCell>
                          <TableCell>{item.volume.toLocaleString()}</TableCell>
                          <TableCell>{item.carrier}</TableCell>
                          <TableCell>${item.rate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            CSV
          </Button>
          
          <Button variant="outline" size="sm" onClick={generatePDF}>
            <FileJson className="w-4 h-4 mr-2" />
            PDF
          </Button>
          
          <Button className="bg-secondary hover:bg-secondary/90" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* Compact Filters - All Input Boxes */}
      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          
          <Input 
            placeholder="Search lanes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-48 text-sm bg-background"
          />
          
          <Input 
            placeholder="Carrier (e.g., FedEx)" 
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="h-8 w-32 text-sm bg-background"
          />

          <Input 
            placeholder="Equipment type" 
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="h-8 w-32 text-sm bg-background"
          />

          <div className="flex items-center gap-1 bg-muted/30 rounded-md px-2 py-1">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Vol:</span>
            <Input
              type="number"
              placeholder="Min"
              value={volumeRange[0]}
              onChange={(e) => setVolumeRange([parseInt(e.target.value) || 0, volumeRange[1]])}
              className="h-7 w-16 text-xs bg-background"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={volumeRange[1]}
              onChange={(e) => setVolumeRange([volumeRange[0], parseInt(e.target.value) || 100000])}
              className="h-7 w-16 text-xs bg-background"
            />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs">
              <X className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <Card className="p-4 bg-secondary/10 border-secondary">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Selected</p>
                <p className="text-lg font-semibold text-secondary">{selectedCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="text-lg font-semibold">{totalVolume.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Cost</p>
                <p className="text-lg font-semibold">${totalCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Carriers</p>
                <p className="text-lg font-semibold">{uniqueCarriersCount}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-8"
            >
              Clear Selection
            </Button>
          </div>
        </Card>
      )}

      {/* Data Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>RFQ-Ready Lanes</h3>
          <span className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {data.length} lanes
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Lane ID</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Recommended Rate</TableHead>
                <TableHead>Savings Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow 
                  key={row.id}
                  className={`${getVolumeColorClass(row.volume)} ${row.selected ? 'bg-secondary/5' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={row.selected}
                      onCheckedChange={() => toggleSelection(row.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{row.laneId}</TableCell>
                  <TableCell>{row.origin}</TableCell>
                  <TableCell>{row.destination}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {row.volume.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: getCarrierInfo(row.carrier).color }}
                      >
                        {getCarrierInfo(row.carrier).initials}
                      </div>
                      <span className="text-sm">{row.carrier}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {row.service}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getEquipmentColor(row.equipment)} text-xs`} variant="outline">
                      {row.equipment}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-secondary">
                    ${row.rate}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 ${
                      row.trendUp ? 'text-secondary' : 'text-destructive'
                    }`}>
                      {row.trendUp ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {row.trend}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}