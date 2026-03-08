import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Truck, Brain, BarChart3, Map } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary p-2 rounded-lg">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl">Lane Intelligence Builder</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-Powered Logistics Data Intelligence
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input-background"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Login
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <a href="#" className="text-secondary hover:underline">
              Forgot password?
            </a>
          </div>
        </Card>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-lg text-white space-y-8">
          <div>
            <h2 className="text-4xl mb-4">
              Transform Your Logistics Data
            </h2>
            <p className="text-lg opacity-90">
              Automatically clean, standardize, and analyze shipment data to
              optimize your supply chain operations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Brain className="w-8 h-8 mb-3 text-secondary" />
              <h3 className="mb-2">AI-Powered</h3>
              <p className="text-sm opacity-80">
                Intelligent data cleaning and standardization
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Map className="w-8 h-8 mb-3 text-secondary" />
              <h3 className="mb-2">Lane Clustering</h3>
              <p className="text-sm opacity-80">
                Identify transportation lanes automatically
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <BarChart3 className="w-8 h-8 mb-3 text-secondary" />
              <h3 className="mb-2">Analytics</h3>
              <p className="text-sm opacity-80">
                Deep insights into your logistics operations
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Truck className="w-8 h-8 mb-3 text-secondary" />
              <h3 className="mb-2">RFQ Ready</h3>
              <p className="text-sm opacity-80">
                Generate procurement-ready datasets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
