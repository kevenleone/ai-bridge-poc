import { FunctionCallPayload } from '../AI';

type BlogPayload = {
  count: number;
  language: string;
  length: number;
  topic: string;
};

export const blogPrompt = (payload: BlogPayload): FunctionCallPayload => {
  const { count, language, length, topic } = payload;

  const parameters = {
    properties: {
      articles: {
        description: `An array of ${count} blog articles`,
        items: {
          properties: {
            alternativeHeadline: {
              description:
                'A headline that is a summary of the blog article translated into ' +
                language,
              type: 'string',
            },
            articleBody: {
              description:
                'The content of the blog article needs to be ' +
                length +
                ' words or more. Remove any double quotes and translate the article into ' +
                language,
              type: 'string',
            },
            headline: {
              description:
                'The title of the blog artcile translated into ' + language,
              type: 'string',
            },
            picture_description: {
              description:
                'A description of an appropriate image for this blog in three sentences.',
              type: 'string',
            },
          },
          required: [
            'headline',
            'alternativeHeadline',
            'articleBody',
            'picture_description',
          ],
          type: 'object',
        },
        required: ['articles'],
        type: 'array',
      },
    },
    type: 'object',
  };

  return {
    message: {
      role: 'system',
      messages: [
        { role: 'system', text: 'You are a blog author.' },
        {
          role: 'user',
          text: `Write blogs on the subject of: ${topic}. It is important that each blog article's content is ${length} words or more and translated into ${language}`,
        },
      ],
    },
    functions: [{ name: 'get_blog_content', parameters }],
  };
};
