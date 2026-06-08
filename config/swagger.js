const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description:
      'RESTful API for managing tasks with JWT authentication and role-based access control. ' +
      'Regular users can manage their own tasks; admins have full access to all tasks.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'User registration and authentication',
    },
    {
      name: 'Tasks',
      description: 'Task CRUD operations (requires authentication)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from the login endpoint',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '665f1a2b3c4d5e6f7a8b9c0d',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            example: 'user',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-08T10:30:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-08T10:30:00.000Z',
          },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '665f1a2b3c4d5e6f7a8b9c0e',
          },
          title: {
            type: 'string',
            example: 'Finish project report',
          },
          description: {
            type: 'string',
            example: 'Complete the Q2 summary report',
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed'],
            example: 'pending',
          },
          userId: {
            type: 'string',
            example: '665f1a2b3c4d5e6f7a8b9c0d',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-08T10:30:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-08T10:30:00.000Z',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Task not found',
          },
          errors: {
            type: 'array',
            description: 'Detailed validation errors (development only)',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                value: { type: 'string' },
                msg: { type: 'string' },
                path: { type: 'string' },
                location: { type: 'string' },
              },
            },
          },
        },
        required: ['success', 'message'],
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 6,
            example: 'password123',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            minLength: 3,
            maxLength: 200,
            example: 'Finish project report',
          },
          description: {
            type: 'string',
            example: 'Complete the Q2 summary report',
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed'],
            default: 'pending',
            example: 'pending',
          },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 3,
            maxLength: 200,
            example: 'Updated task title',
          },
          description: {
            type: 'string',
            example: 'Updated description',
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed'],
            example: 'completed',
          },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description:
          'Creates a new user account with the default role of `user`. ' +
          'Password must be at least 6 characters.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
              example: {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User registered successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
                example: {
                  success: true,
                  message: 'User registered successfully',
                  data: {
                    user: {
                      id: '665f1a2b3c4d5e6f7a8b9c0d',
                      name: 'John Doe',
                      email: 'john@example.com',
                      role: 'user',
                      createdAt: '2026-06-08T10:30:00.000Z',
                      updatedAt: '2026-06-08T10:30:00.000Z',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or email already registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validationError: {
                    summary: 'Validation error',
                    value: {
                      success: false,
                      message: 'Password must be at least 6 characters',
                    },
                  },
                  duplicateEmail: {
                    summary: 'Duplicate email',
                    value: {
                      success: false,
                      message: 'Email is already registered',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description:
          'Authenticates a user with email and password. Returns a JWT token ' +
          'to use in the `Authorization` header for protected routes.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
              example: {
                email: 'john@example.com',
                password: 'password123',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful' },
                    data: {
                      type: 'object',
                      properties: {
                        token: {
                          type: 'string',
                          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
                example: {
                  success: true,
                  message: 'Login successful',
                  data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWYxYTJiM2M0ZDVlNmY3YThiOWMwZCIsImlhdCI6MTcxNzgzODIwMCwiZXhwIjoxNzE4NDQyMjAwfQ.example',
                    user: {
                      id: '665f1a2b3c4d5e6f7a8b9c0d',
                      name: 'John Doe',
                      email: 'john@example.com',
                      role: 'user',
                      createdAt: '2026-06-08T10:30:00.000Z',
                      updatedAt: '2026-06-08T10:30:00.000Z',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Email is required',
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Invalid email or password',
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        description:
          'Creates a task for the authenticated user. The `userId` is automatically ' +
          'set from the JWT token. Title must be at least 3 characters.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateTaskRequest',
              },
              example: {
                title: 'Finish project report',
                description: 'Complete the Q2 summary report',
                status: 'pending',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task created successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        task: { $ref: '#/components/schemas/Task' },
                      },
                    },
                  },
                },
                example: {
                  success: true,
                  message: 'Task created successfully',
                  data: {
                    task: {
                      id: '665f1a2b3c4d5e6f7a8b9c0e',
                      title: 'Finish project report',
                      description: 'Complete the Q2 summary report',
                      status: 'pending',
                      userId: '665f1a2b3c4d5e6f7a8b9c0d',
                      createdAt: '2026-06-08T10:30:00.000Z',
                      updatedAt: '2026-06-08T10:30:00.000Z',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Title must be at least 3 characters',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized — missing or invalid JWT',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'You are not logged in. Please provide a valid token.',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Tasks'],
        summary: 'Get all tasks',
        description:
          'Returns all tasks for admin users. Regular users only see their own tasks.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    results: { type: 'integer', example: 2 },
                    data: {
                      type: 'object',
                      properties: {
                        tasks: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Task' },
                        },
                      },
                    },
                  },
                },
                example: {
                  success: true,
                  results: 2,
                  data: {
                    tasks: [
                      {
                        id: '665f1a2b3c4d5e6f7a8b9c0e',
                        title: 'Finish project report',
                        description: 'Complete the Q2 summary report',
                        status: 'pending',
                        userId: '665f1a2b3c4d5e6f7a8b9c0d',
                        createdAt: '2026-06-08T10:30:00.000Z',
                        updatedAt: '2026-06-08T10:30:00.000Z',
                      },
                      {
                        id: '665f1a2b3c4d5e6f7a8b9c0f',
                        title: 'Review pull requests',
                        description: '',
                        status: 'completed',
                        userId: '665f1a2b3c4d5e6f7a8b9c0d',
                        createdAt: '2026-06-07T08:15:00.000Z',
                        updatedAt: '2026-06-08T09:00:00.000Z',
                      },
                    ],
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized — missing or invalid JWT',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Invalid token. Please log in again.',
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a task by ID',
        description:
          'Retrieves a single task. Admins can access any task; users can only access their own.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'MongoDB ObjectId of the task',
            example: '665f1a2b3c4d5e6f7a8b9c0e',
          },
        ],
        responses: {
          200: {
            description: 'Task retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        task: { $ref: '#/components/schemas/Task' },
                      },
                    },
                  },
                },
                example: {
                  success: true,
                  data: {
                    task: {
                      id: '665f1a2b3c4d5e6f7a8b9c0e',
                      title: 'Finish project report',
                      description: 'Complete the Q2 summary report',
                      status: 'pending',
                      userId: '665f1a2b3c4d5e6f7a8b9c0d',
                      createdAt: '2026-06-08T10:30:00.000Z',
                      updatedAt: '2026-06-08T10:30:00.000Z',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid task ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Invalid task ID',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized — missing or invalid JWT',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'You are not logged in. Please provide a valid token.',
                },
              },
            },
          },
          403: {
            description: 'Forbidden — user does not own this task',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'You do not have permission to access this task',
                },
              },
            },
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Task not found',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update a task',
        description:
          'Updates one or more fields on a task. Only provided fields are validated and updated. ' +
          'Admins can update any task; users can only update their own.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'MongoDB ObjectId of the task',
            example: '665f1a2b3c4d5e6f7a8b9c0e',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateTaskRequest',
              },
              example: {
                title: 'Updated task title',
                status: 'completed',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task updated successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        task: { $ref: '#/components/schemas/Task' },
                      },
                    },
                  },
                },
                example: {
                  success: true,
                  message: 'Task updated successfully',
                  data: {
                    task: {
                      id: '665f1a2b3c4d5e6f7a8b9c0e',
                      title: 'Updated task title',
                      description: 'Complete the Q2 summary report',
                      status: 'completed',
                      userId: '665f1a2b3c4d5e6f7a8b9c0d',
                      createdAt: '2026-06-08T10:30:00.000Z',
                      updatedAt: '2026-06-08T11:45:00.000Z',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or invalid task ID',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Title must be at least 3 characters',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized — missing or invalid JWT',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Invalid token. Please log in again.',
                },
              },
            },
          },
          403: {
            description: 'Forbidden — user does not own this task',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'You do not have permission to access this task',
                },
              },
            },
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Task not found',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        description:
          'Permanently deletes a task. Admins can delete any task; users can only delete their own.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'MongoDB ObjectId of the task',
            example: '665f1a2b3c4d5e6f7a8b9c0e',
          },
        ],
        responses: {
          200: {
            description: 'Task deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task deleted successfully' },
                  },
                },
                example: {
                  success: true,
                  message: 'Task deleted successfully',
                },
              },
            },
          },
          400: {
            description: 'Invalid task ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Invalid task ID',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized — missing or invalid JWT',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'You are not logged in. Please provide a valid token.',
                },
              },
            },
          },
          403: {
            description: 'Forbidden — user does not own this task',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'You do not have permission to access this task',
                },
              },
            },
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Task not found',
                },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerUiOptions = {
  customSiteTitle: 'Task Management API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

module.exports = {
  swaggerUi,
  swaggerSpec,
  swaggerUiOptions,
};
