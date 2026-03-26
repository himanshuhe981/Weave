"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    question: 'What is Weave and how does it work?',
    answer:
      'Weave is a visual workflow automation platform that lets you connect different apps and services without writing code. Simply drag nodes onto a canvas, connect them together, and your workflow runs automatically in the cloud.',
  },
  {
    question: 'How many integrations does Weave support?',
    answer:
      'Weave currently supports 15 powerful nodes including triggers (Manual, Google Forms, Stripe, Webhook, Schedule) and actions (HTTP Request, OpenAI, Gemini, Anthropic, Discord, Slack, Telegram, IF Condition, JSON Transform, Delay). We\'re constantly adding new integrations.',
  },
  {
    question: 'Can I use AI in my workflows?',
    answer:
      'Yes! Weave has built-in support for three major AI providers: OpenAI (GPT-4), Google Gemini, and Anthropic Claude. You can add AI processing to any workflow to analyze data, generate content, or make intelligent decisions.',
  },
  {
    question: 'Is there a free plan?',
    answer:
      'Yes, our Starter plan is completely free and includes 100 workflow executions per month, up to 5 active workflows, and access to all 15 nodes. Perfect for trying out Weave and building your first automations.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'We take security seriously. All credentials are encrypted with enterprise-grade encryption, we\'re SOC 2 compliant, and your workflow data is stored securely in PostgreSQL. Enterprise plans include SSO and advanced security features.',
  },
  {
    question: 'Can I export my workflows?',
    answer:
      'Yes, all workflows can be exported as JSON templates and shared with your team or community. You can also save reusable workflow components for faster automation building.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {FAQS.map((faq, index) => (
        <motion.div
          key={index}
          className="bg-white border border-black/5 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        >
          <button
            className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-black/[0.02] transition-colors"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span
              className="text-lg font-semibold pr-8"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {faq.question}
            </span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {openIndex === index ? (
                <Minus className="w-5 h-5 shrink-0" />
              ) : (
                <Plus className="w-5 h-5 shrink-0" />
              )}
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="px-8 pb-6">
                  <p
                    className="text-black/60 leading-relaxed"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
