import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OLX Search Tool
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Extract and analyze OLX listings with powerful filtering by location, price, and date. 
              Perfect for market research and finding the best deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/board">
                  <Search className="h-5 w-5 mr-2" />
                  Start Searching
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Filter className="h-5 w-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose OLX Search Tool?</h2>
          <p className="text-muted-foreground text-lg">
            A powerful way to analyze and filter marketplace listings
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Search className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>URL Extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Simply paste any OLX search URL and extract all listings automatically
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Filter className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Filtering</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Filter by city, neighborhood, price range, and posting date for precise results
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Instant Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get immediate insights with sortable results and detailed property information
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
