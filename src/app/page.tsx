import Link from "next/link";
import { 
  TrendingUp, 
  Activity, 
  PieChart, 
  Target, 
  ShieldCheck, 
  MessageSquare, 
  Newspaper 
} from "lucide-react";

const features = [
  { name: 'Investment Advisor', href: '/advisor', icon: TrendingUp, desc: 'Personalized AI investment suggestions based on your goals.' },
  { name: 'Financial Health', href: '/health', icon: Activity, desc: 'Analyze your financial metrics and get AI recommendations.' },
  { name: 'Portfolio Analyzer', href: '/portfolio', icon: PieChart, desc: 'Upload portfolio for professional AI insights & diversification check.' },
  { name: 'SIP Calculator', href: '/sip', icon: Target, desc: 'Calculate monthly SIP required to achieve your future goals.' },
  { name: 'Tax Advisor', href: '/tax', icon: ShieldCheck, desc: 'AI suggestions for reducing your tax liability effectively.' },
  { name: 'Support & Lead Bot', href: '/support', icon: MessageSquare, desc: 'Intelligent AI assistant for queries and lead qualification.' },
  { name: 'Market News', href: '/news', icon: Newspaper, desc: 'Daily automated summaries of the financial markets.' },
];

export default function Home() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full">
      <header className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl font-bold mb-2">Welcome to Knowith AI</h1>
        <p className="text-gray-400 text-lg">Select an AI assistant to get started with your financial journey.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.name} href={feature.href} className="group outline-none">
              <div className="glass-card p-6 h-full flex flex-col items-start gap-4 ring-1 ring-transparent group-focus:ring-blue-500 hover:-translate-y-1 transition-transform">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">{feature.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
