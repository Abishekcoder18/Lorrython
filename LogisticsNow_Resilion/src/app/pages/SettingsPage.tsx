import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Save, Plus, Trash2 } from "lucide-react";

const locationMappings = [
  { id: 1, from: "NYC", to: "New York, NY" },
  { id: 2, from: "LA", to: "Los Angeles, CA" },
  { id: 3, from: "Chi-town", to: "Chicago, IL" },
  { id: 4, from: "SF", to: "San Francisco, CA" },
];

const equipmentMappings = [
  { id: 1, from: "53' Dry Van", to: "Dry Van 53ft" },
  { id: 2, from: "Reefer 53'", to: "Reefer 53ft" },
  { id: 3, from: "48ft Flatbed", to: "Flatbed 48ft" },
  { id: 4, from: "Box Truck", to: "Box Truck 26ft" },
];

export function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">
          Configure data cleaning rules and preferences
        </p>
      </div>

      <Tabs defaultValue="cleaning" className="space-y-6">
        <TabsList>
          <TabsTrigger value="cleaning">Data Cleaning</TabsTrigger>
          <TabsTrigger value="normalization">Normalization</TabsTrigger>
          <TabsTrigger value="equipment">Equipment Mapping</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="cleaning" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Data Cleaning Rules</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label>Auto-fix location formatting</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically standardize city and state formats
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label>Remove duplicate shipments</Label>
                  <p className="text-sm text-muted-foreground">
                    Detect and remove exact duplicate entries
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label>Standardize carrier names</Label>
                  <p className="text-sm text-muted-foreground">
                    Use consistent naming for carrier companies
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label>Validate weight ranges</Label>
                  <p className="text-sm text-muted-foreground">
                    Flag shipments with unusual weight values
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <Label>Enable fuzzy matching</Label>
                  <p className="text-sm text-muted-foreground">
                    Use AI to detect similar but not identical records
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Deduplication Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Similarity Threshold (%)</Label>
                <Input
                  type="number"
                  defaultValue="85"
                  className="bg-input-background mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Records above this threshold will be considered duplicates
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="normalization" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Location Normalization Dictionary</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Mapping
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From (Input)</TableHead>
                  <TableHead>To (Standardized)</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationMappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>{mapping.from}</TableCell>
                    <TableCell>{mapping.to}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Custom Normalization Rules</h3>
            <div className="space-y-4">
              <div>
                <Label>Pattern Match Rules (JSON)</Label>
                <Textarea
                  className="bg-input-background mt-2 font-mono text-sm"
                  rows={8}
                  defaultValue={`{
  "state_abbreviations": true,
  "zip_code_format": "5-digit",
  "remove_special_chars": true,
  "lowercase_conversion": false
}`}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Equipment Type Mapping</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Mapping
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From (Input)</TableHead>
                  <TableHead>To (Standardized)</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentMappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>{mapping.from}</TableCell>
                    <TableCell>{mapping.to}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">User Profile</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    defaultValue="John"
                    className="bg-input-background mt-2"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    defaultValue="Doe"
                    className="bg-input-background mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  defaultValue="john.doe@company.com"
                  className="bg-input-background mt-2"
                />
              </div>

              <div>
                <Label>Company</Label>
                <Input
                  defaultValue="Acme Logistics"
                  className="bg-input-background mt-2"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label>Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about data processing
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <Label>Weekly analytics reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Get weekly summaries of your data quality
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
