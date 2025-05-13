import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon, VercelIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <VercelIcon size={32} />
          <span>+</span>
          <MessageIcon size={32} />
        </p>
        <p>
          This is an open-source project built with Next.js and AI technology,
          designed to provide developers with an efficient API management and
          control platform. The source code is available on{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://github.com/yourusername/api-mcp"
            target="_blank"
          >
            GitHub
          </Link>{' '}
          API-MCP uses advanced AI technology to convert API interfaces in the
          database into intelligent tools, supporting natural language queries
          and various data visualization methods.
        </p>
        <p>
          Learn more about API-MCP by visiting our{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://github.com/yourusername/api-mcp/docs"
            target="_blank"
          >
            documentation
          </Link>
          . Community contributions and feedback are welcome!
        </p>
      </div>
    </motion.div>
  );
};
