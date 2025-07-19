
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Shield,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Complete student profiles, enrollment tracking, and parent communication."
    },
    {
      icon: BookOpen,
      title: "Class Management",
      description: "Organize classes, assign teachers, and manage academic schedules."
    },
    {
      icon: Calendar,
      title: "Attendance Tracking",
      description: "Digital attendance with real-time reporting and notifications."
    },
    {
      icon: BarChart3,
      title: "Grade Management",
      description: "Comprehensive gradebook with assignment tracking and analytics."
    },
    {
      icon: Shield,
      title: "Multi-tenant Security",
      description: "Each school's data is completely isolated and secure."
    }
  ];

  const plans = [
    {
      name: "Basic",
      price: "$29",
      period: "per month",
      description: "Perfect for small schools",
      features: [
        "Up to 100 students",
        "Basic attendance tracking",
        "Grade management",
        "Email support"
      ]
    },
    {
      name: "Premium",
      price: "$79",
      period: "per month",
      description: "For growing institutions",
      features: [
        "Up to 500 students",
        "Advanced reporting",
        "Parent portal access",
        "Priority support",
        "Custom branding"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large school districts",
      features: [
        "Unlimited students",
        "Advanced analytics",
        "API access",
        "Dedicated support",
        "Custom integrations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Madariss</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="outline">Administrator Login</Button>
            </Link>
            <Button>Contact Sales</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Complete School Management
          <span className="block text-blue-600">Made Simple</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Streamline your school operations with our comprehensive SaaS platform. 
          Manage students, classes, attendance, and grades all in one secure, 
          multi-tenant system designed for modern educational institutions.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="text-lg px-8 py-4">
            Contact Sales
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-4">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your School
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform provides all the tools necessary to run a modern educational institution efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your school's needs. All plans include our core features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200'}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" variant={plan.popular ? "default" : "outline"}>
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Transform Your School Management?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Contact us to get started with Madariss for your educational institution.
        </p>
        <Button size="lg" className="text-lg px-8 py-4">
          Contact Sales Today
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="text-xl font-bold">Madariss</span>
          </div>
          <p className="text-gray-400">
            Complete school management solution for modern educational institutions.
          </p>
        </div>
      </footer>
    </div>
  );
}
