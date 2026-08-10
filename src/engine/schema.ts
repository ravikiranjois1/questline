/** JSON Schema for course.json — the structural half of manifest validation. */
export const courseManifestSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['id', 'title', 'version', 'description', 'gamification', 'chapters', 'items'],
  additionalProperties: true,
  properties: {
    id: { type: 'string', minLength: 1 },
    title: { type: 'string', minLength: 1 },
    version: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    gamification: {
      type: 'object',
      required: ['xpPerMilestone', 'levels', 'badges'],
      properties: {
        xpPerMilestone: { type: 'number', minimum: 0 },
        levels: { type: 'array', items: { type: 'number' }, minItems: 1 },
        badges: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'title', 'when'],
            properties: {
              id: { type: 'string', minLength: 1 },
              title: { type: 'string', minLength: 1 },
              when: { type: 'string', minLength: 1 },
            },
          },
        },
      },
    },
    chapters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'kind', 'requires', 'children'],
        properties: {
          id: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 1 },
          kind: { type: 'string', minLength: 1 },
          requires: { type: 'array', items: { type: 'string' } },
          children: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'kind', 'requires', 'content', 'milestones'],
        properties: {
          id: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 1 },
          kind: { type: 'string', minLength: 1 },
          requires: { type: 'array', items: { type: 'string' } },
          content: { type: 'array', items: { type: 'string' } },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'title'],
              properties: {
                id: { type: 'string', minLength: 1 },
                title: { type: 'string', minLength: 1 },
                xp: { type: 'number', minimum: 0 },
              },
            },
          },
        },
      },
    },
  },
} as const;
