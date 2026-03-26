"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from '@/components/landing_page/navigation';
import { MobileNavigation } from '@/components/landing_page/mobile-navigation';
import { CustomCursor } from '@/components/landing_page/custom-cursor';
import { LiquidGlassBox, LiquidGlassButton } from '@/components/landing_page/liquid-glass';
import { 
  BookOpen, 
  Code2, 
  Zap, 
  Puzzle, 
  Shield, 
  Terminal,
  ChevronRight,
  Copy,
  Check,
  Menu,
  X,
  ArrowLeft,
  Palette,
  Bot,
  Clock,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const SIDEBAR_SECTIONS = [
  {
    title: 'Getting Started',
    icon: <BookOpen className="w-4 h-4" />,
    items: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'quick-start', label: 'Quick Start' },
      { id: 'core-concepts', label: 'Core Concepts' },
    ]
  },
  {
    title: 'Building Workflows',
    icon: <Zap className="w-4 h-4" />,
    items: [
      { id: 'creating-workflows', label: 'Creating Workflows' },
      { id: 'trigger-nodes', label: 'Trigger Nodes' },
      { id: 'action-nodes', label: 'Action Nodes' },
      { id: 'data-flow', label: 'Data Flow' },
    ]
  },
  {
    title: 'Integrations',
    icon: <Puzzle className="w-4 h-4" />,
    items: [
      { id: 'ai-providers', label: 'AI Providers' },
      { id: 'webhooks', label: 'Webhooks & APIs' },
      { id: 'messaging', label: 'Messaging Apps' },
    ]
  },
  {
    title: 'Advanced',
    icon: <Code2 className="w-4 h-4" />,
    items: [
      { id: 'api-reference', label: 'API Reference' },
      { id: 'authentication', label: 'Authentication' },
      { id: 'error-handling', label: 'Error Handling' },
    ]
  },
];

const CONTENT: Record<string, { title: string; content: React.ReactNode }> = {
  introduction: {
    title: 'Introduction to Weave',
    content: (
      <div className="prose prose-stone max-w-none">
        <p className="text-xl text-black/70 mb-8 leading-relaxed" style={{ fontFamily: 'Sora, sans-serif' }}>
          Weave is a visual workflow automation platform that lets you connect APIs, AI models, and services without writing code.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          What is Weave?
        </h2>
        <p className="text-lg text-black/70 mb-6 leading-relaxed" style={{ fontFamily: 'Sora, sans-serif' }}>
          Weave provides a node-based visual editor where you can build complex automation workflows by connecting triggers and actions. 
          Each workflow starts with a trigger (like a webhook, form submission, or schedule) and performs actions (like calling APIs, 
          processing data with AI, or sending messages).
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Key Features
        </h2>
        <ul className="space-y-4 text-lg text-black/70" style={{ fontFamily: 'Sora, sans-serif' }}>
          <li className="flex items-start gap-3">
            <Palette className="w-6 h-6 text-black/50 flex-shrink-0 mt-0.5" />
            <span><strong>Visual Editor:</strong> Drag-and-drop interface for building workflows</span>
          </li>
          <li className="flex items-start gap-3">
            <Bot className="w-6 h-6 text-black/50 flex-shrink-0 mt-0.5" />
            <span><strong>AI Integration:</strong> Built-in support for OpenAI, Gemini, and Claude</span>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-black/50 flex-shrink-0 mt-0.5" />
            <span><strong>Real-time Execution:</strong> Instant triggers and live debugging</span>
          </li>
          <li className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-black/50 flex-shrink-0 mt-0.5" />
            <span><strong>Enterprise Security:</strong> Encrypted credentials and audit logs</span>
          </li>
        </ul>

        <h2 className="text-3xl font-bold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Use Cases
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <LiquidGlassBox variant="light" className="p-6">
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Content Generation
            </h3>
            <p className="text-black/60" style={{ fontFamily: 'Sora, sans-serif' }}>
              Automate blog posts, social media content, and marketing copy with AI-powered workflows.
            </p>
          </LiquidGlassBox>
          <LiquidGlassBox variant="light" className="p-6">
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Customer Support
            </h3>
            <p className="text-black/60" style={{ fontFamily: 'Sora, sans-serif' }}>
              Route tickets, generate responses, and automate follow-ups across multiple channels.
            </p>
          </LiquidGlassBox>
          <LiquidGlassBox variant="light" className="p-6">
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Data Processing
            </h3>
            <p className="text-black/60" style={{ fontFamily: 'Sora, sans-serif' }}>
              Transform, enrich, and sync data between your tools and databases automatically.
            </p>
          </LiquidGlassBox>
          <LiquidGlassBox variant="light" className="p-6">
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Team Notifications
            </h3>
            <p className="text-black/60" style={{ fontFamily: 'Sora, sans-serif' }}>
              Send alerts to Slack, Discord, or Telegram based on custom conditions and events.
            </p>
          </LiquidGlassBox>
        </div>
      </div>
    )
  },
  'quick-start': {
    title: 'Quick Start Guide',
    content: (
      <div className="prose prose-stone max-w-none">
        <p className="text-xl text-black/70 mb-8 leading-relaxed" style={{ fontFamily: 'Sora, sans-serif' }}>
          Get up and running with Weave in under 5 minutes.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          1. Create Your First Workflow
        </h2>
        <CodeBlock
          code={`// Navigate to the Weave dashboard
https://app.weave.io/workflows/new

// Or use the CLI
npx weave create my-first-workflow`}
        />

        <h2 className="text-3xl font-bold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          2. Add a Trigger Node
        </h2>
        <p className="text-lg text-black/70 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Every workflow starts with a trigger. Drag a trigger node from the left panel onto your canvas.
        </p>
        <LiquidGlassBox variant="light" className="p-6 mb-6">
          <h4 className="font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
            Example: Webhook Trigger
          </h4>
          <CodeBlock
            code={`{
  "trigger": "webhook",
  "method": "POST",
  "path": "/my-webhook",
  "authentication": "bearer"
}`}
          />
        </LiquidGlassBox>

        <h2 className="text-3xl font-bold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          3. Add Action Nodes
        </h2>
        <p className="text-lg text-black/70 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Connect action nodes to process data, call APIs, or send messages.
        </p>
        <CodeBlock
          code={`// Example: OpenAI + Slack Workflow
{
  "nodes": [
    {
      "id": "trigger",
      "type": "webhook"
    },
    {
      "id": "ai",
      "type": "openai",
      "config": {
        "model": "gpt-4",
        "prompt": "Summarize: {{trigger.body.text}}"
      }
    },
    {
      "id": "notify",
      "type": "slack",
      "config": {
        "channel": "#notifications",
        "message": "{{ai.response}}"
      }
    }
  ]
}`}
        />

        <h2 className="text-3xl font-bold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          4. Test & Deploy
        </h2>
        <p className="text-lg text-black/70 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Click the "Test" button to run your workflow with sample data. Once verified, click "Deploy" to activate it.
        </p>
        <LiquidGlassButton variant="primary" size="md">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Deploy Workflow
          </span>
        </LiquidGlassButton>
      </div>
    )
  },
  'core-concepts': {
    title: 'Core Concepts',
    content: (
      <div className="prose prose-stone max-w-none">
        <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Understanding Workflows
        </h2>
        <p className="text-lg text-black/70 mb-8 leading-relaxed" style={{ fontFamily: 'Sora, sans-serif' }}>
          A workflow in Weave is a directed graph of nodes that execute in sequence or parallel based on your configuration.
        </p>

        <div className="space-y-8">
          <ConceptCard
            title="Nodes"
            description="Individual units of work in your workflow. Each node has inputs, outputs, and configuration."
            icon={<Puzzle className="w-6 h-6" />}
          />
          <ConceptCard
            title="Connections"
            description="Links between nodes that define data flow. Outputs from one node become inputs for the next."
            icon={<ChevronRight className="w-6 h-6" />}
          />
          <ConceptCard
            title="Execution Context"
            description="The runtime environment containing all data, variables, and state during workflow execution."
            icon={<Terminal className="w-6 h-6" />}
          />
          <ConceptCard
            title="Error Handling"
            description="Built-in retry logic, error branches, and fallback mechanisms for robust workflows."
            icon={<Shield className="w-6 h-6" />}
          />
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Data Flow
        </h2>
        <p className="text-lg text-black/70 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Data flows through your workflow using variable interpolation syntax:
        </p>
        <CodeBlock
          code={`// Access trigger data
{{trigger.body.user.email}}

// Access previous node output
{{openai.response.content}}

// Use built-in functions
{{uppercase(trigger.body.name)}}
{{json.parse(http.response)}}

// Conditional logic
{{if(trigger.body.amount > 100, "high", "low")}}`}
        />
      </div>
    )
  },
  'creating-workflows': {
    title: 'Creating Workflows',
    content: (
      <div className="prose prose-stone max-w-none">
        <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Building Your First Workflow
        </h2>
        <p className="text-xl text-black/70 mb-8 leading-relaxed" style={{ fontFamily: 'Sora, sans-serif' }}>
          Learn how to create, configure, and deploy workflows using the visual editor.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <LiquidGlassBox variant="light" className="p-6">
            <div className="text-3xl mb-4">01</div>
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Choose Your Trigger
            </h3>
            <p className="text-black/60 text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Start with how you want your workflow to begin - webhook, form submission, schedule, or manual trigger.
            </p>
          </LiquidGlassBox>

          <LiquidGlassBox variant="light" className="p-6">
            <div className="text-3xl mb-4">02</div>
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Add Actions
            </h3>
            <p className="text-black/60 text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Drag action nodes onto the canvas and connect them to your trigger. Configure each node's settings.
            </p>
          </LiquidGlassBox>

          <LiquidGlassBox variant="light" className="p-6">
            <div className="text-3xl mb-4">03</div>
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Configure Data Flow
            </h3>
            <p className="text-black/60 text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Map data between nodes using our visual data mapper or write expressions directly.
            </p>
          </LiquidGlassBox>

          <LiquidGlassBox variant="light" className="p-6">
            <div className="text-3xl mb-4">04</div>
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Test & Deploy
            </h3>
            <p className="text-black/60 text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Run test executions with sample data, debug any issues, then deploy to production.
            </p>
          </LiquidGlassBox>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Best Practices
        </h2>
        <ul className="space-y-4 text-lg text-black/70" style={{ fontFamily: 'Sora, sans-serif' }}>
          <li>✓ Name your nodes descriptively for easier debugging</li>
          <li>✓ Add error handling nodes for critical workflows</li>
          <li>✓ Use conditional branches to handle different scenarios</li>
          <li>✓ Test with real data before deploying to production</li>
          <li>✓ Monitor execution logs regularly</li>
        </ul>
      </div>
    )
  },
  'ai-providers': {
    title: 'AI Providers',
    content: (
      <div className="prose prose-stone max-w-none">
        <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Integrating AI Models
        </h2>
        <p className="text-xl text-black/70 mb-8 leading-relaxed" style={{ fontFamily: 'Sora, sans-serif' }}>
          Weave supports OpenAI, Google Gemini, and Anthropic Claude out of the box.
        </p>

        <h3 className="text-2xl font-semibold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          OpenAI Configuration
        </h3>
        <CodeBlock
          code={`{
  "type": "openai",
  "config": {
    "model": "gpt-4-turbo",
    "temperature": 0.7,
    "max_tokens": 1000,
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "{{trigger.body.prompt}}"
      }
    ]
  }
}`}
        />

        <h3 className="text-2xl font-semibold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Google Gemini Configuration
        </h3>
        <CodeBlock
          code={`{
  "type": "gemini",
  "config": {
    "model": "gemini-pro",
    "temperature": 0.9,
    "prompt": "Generate a creative story about {{trigger.body.topic}}"
  }
}`}
        />

        <h3 className="text-2xl font-semibold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Anthropic Claude Configuration
        </h3>
        <CodeBlock
          code={`{
  "type": "anthropic",
  "config": {
    "model": "claude-3-opus",
    "max_tokens": 2048,
    "messages": [
      {
        "role": "user",
        "content": "Analyze this data: {{trigger.body.data}}"
      }
    ]
  }
}`}
        />
      </div>
    )
  },
  'api-reference': {
    title: 'API Reference',
    content: (
      <div className="prose prose-stone max-w-none">
        <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          REST API
        </h2>
        <p className="text-xl text-black/70 mb-8 leading-relaxed" style={{ fontFamily: 'Sora, sans-serif' }}>
          Interact with Weave programmatically using our REST API.
        </p>

        <h3 className="text-2xl font-semibold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Authentication
        </h3>
        <p className="text-lg text-black/70 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          All API requests require an API key passed in the Authorization header:
        </p>
        <CodeBlock
          code={`curl -X GET https://api.weave.io/v1/workflows \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
        />

        <h3 className="text-2xl font-semibold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Create Workflow
        </h3>
        <CodeBlock
          code={`POST /v1/workflows

{
  "name": "My Workflow",
  "description": "Automated content generation",
  "nodes": [...],
  "connections": [...]
}

Response:
{
  "id": "wf_abc123",
  "status": "active",
  "created_at": "2026-03-03T10:00:00Z"
}`}
        />

        <h3 className="text-2xl font-semibold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Trigger Workflow
        </h3>
        <CodeBlock
          code={`POST /v1/workflows/{workflow_id}/execute

{
  "data": {
    "user_input": "Generate a blog post about AI"
  }
}

Response:
{
  "execution_id": "exec_xyz789",
  "status": "running",
  "started_at": "2026-03-03T10:05:00Z"
}`}
        />

        <h3 className="text-2xl font-semibold mt-12 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
          Get Execution Status
        </h3>
        <CodeBlock
          code={`GET /v1/executions/{execution_id}

Response:
{
  "id": "exec_xyz789",
  "workflow_id": "wf_abc123",
  "status": "completed",
  "result": {...},
  "duration_ms": 2345
}`}
        />
      </div>
    )
  },
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-black/5 border border-black/10 rounded-2xl p-6 overflow-x-auto text-sm">
        <code className="text-black/80" style={{ fontFamily: 'monospace' }}>
          {code}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

function ConceptCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <LiquidGlassBox variant="light" className="p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-black/5 rounded-xl text-black/70">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            {title}
          </h3>
          <p className="text-black/60" style={{ fontFamily: 'Sora, sans-serif' }}>
            {description}
          </p>
        </div>
      </div>
    </LiquidGlassBox>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <CustomCursor />
      <div className="hidden md:block">
        <Navigation />
      </div>
      <div className="md:hidden">
        <MobileNavigation />
      </div>

      {/* Back Button - Moved to Right */}
      <div className="fixed top-24 md:top-28 right-6 md:right-8 z-40">
        <LiquidGlassButton
          variant="secondary"
          size="sm"
          onClick={() => router.push('/')}
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Home
          </span>
        </LiquidGlassButton>
      </div>

      <div className="max-w-[1600px] mx-auto flex pt-20 md:pt-24">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-black text-white rounded-full shadow-2xl"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || !isMobile) && (
            <motion.aside
              className="fixed md:sticky top-20 md:top-24 left-0 h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] w-80 border-r border-black/10 bg-white md:bg-transparent overflow-y-auto p-6 md:p-8 z-40"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Sora, sans-serif' }}>
                Documentation
              </h2>

              <nav className="space-y-8">
                {SIDEBAR_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-black/40 uppercase tracking-wider mb-4">
                      {section.icon}
                      <span style={{ fontFamily: 'Sora, sans-serif' }}>{section.title}</span>
                    </div>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 rounded-xl transition-all ${
                            activeSection === item.id
                              ? 'bg-black/5 text-black font-semibold'
                              : 'text-black/60 hover:bg-black/5 hover:text-black'
                          }`}
                          style={{ fontFamily: 'Sora, sans-serif' }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 px-6 md:px-12 lg:px-16 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-8" style={{ fontFamily: 'Sora, sans-serif' }}>
                {CONTENT[activeSection]?.title || 'Introduction'}
              </h1>
              <div>
                {CONTENT[activeSection]?.content || CONTENT.introduction.content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between mt-16 pt-8 border-t border-black/10">
            <LiquidGlassButton variant="secondary" size="sm">
              ← Previous
            </LiquidGlassButton>
            <LiquidGlassButton variant="secondary" size="sm">
              Next →
            </LiquidGlassButton>
          </div>
        </main>
      </div>
    </div>
  );
}
