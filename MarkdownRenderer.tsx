
import React from 'react';

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Simple replacement since we don't have a markdown lib in this env
  return (
    <div className="whitespace-pre-wrap font-sans text-gray-800">
        {content}
    </div>
  );
};
export default MarkdownRenderer;
