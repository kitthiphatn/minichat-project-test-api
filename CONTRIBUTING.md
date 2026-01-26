# Contributing to Mini Chat Ollama

Thank you for your interest in contributing to Mini Chat Ollama! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Areas for Contribution](#areas-for-contribution)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences
- Accept responsibility and apologize for mistakes

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)
- **Error messages** and stack traces

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- List any alternative solutions you've considered

### Pull Requests

We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`
2. Make your changes following our coding standards
3. Test your changes thoroughly
4. Update documentation as needed
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- MongoDB (local or Docker)
- Ollama (for local AI provider)

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mini-chat-ollama.git
cd mini-chat-ollama

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Start MongoDB (using Docker)
docker-compose up -d

# Start Ollama
ollama serve
ollama pull llama3

# Run backend (Terminal 1)
cd backend && npm run dev

# Run frontend (Terminal 2)
cd frontend && npm run dev
```

## Coding Standards

### JavaScript/React

- Use ES6+ syntax
- Use functional components with hooks (React)
- Follow consistent naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for components and classes
  - `UPPER_SNAKE_CASE` for constants
- Add JSDoc comments for complex functions
- Keep functions small and focused (single responsibility)
- Use async/await instead of promises chains
- Handle errors properly with try-catch blocks

### Code Style

```javascript
// Good
async function sendMessage(message, provider, model) {
  try {
    const response = await api.post('/message', { message, provider, model });
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

// Bad
function sendMessage(message, provider, model) {
  return api.post('/message', { message, provider, model })
    .then(response => response.data)
    .catch(error => console.error(error));
}
```

### File Organization

- Keep related code together
- Separate concerns (models, controllers, routes, components)
- Use index files for cleaner imports
- Avoid deeply nested directories

### CSS/Styling

- Use Tailwind CSS utility classes
- Keep custom CSS minimal
- Use semantic class names for custom styles
- Ensure responsive design (mobile-first)

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(chat): add streaming response support

Implement server-sent events for real-time AI responses.
This improves user experience by showing responses as they're generated.

Closes #123
```

```
fix(backend): handle Ollama connection timeout

Add proper timeout handling and retry logic for Ollama API calls.
Prevents the app from hanging when Ollama is not responding.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Test your changes**
   - Manually test all affected features
   - Ensure no console errors
   - Test on different browsers if UI changes

2. **Update documentation**
   - Update README.md if adding features
   - Add JSDoc comments for new functions
   - Update API documentation if changing endpoints

3. **Check code quality**
   - Remove console.logs and debug code
   - Ensure consistent formatting
   - Follow coding standards

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tested locally
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in the changelog

## Areas for Contribution

### High Priority

- **Authentication System** - User login and registration
- **Multi-Session Support** - Multiple chat sessions per user
- **Streaming Responses** - Real-time AI response streaming
- **Testing** - Unit and integration tests
- **Mobile Responsiveness** - Improve mobile UI/UX

### Medium Priority

- **Export Chat History** - Download conversations
- **Custom System Prompts** - User-defined AI behavior
- **Theme Toggle** - Dark/light mode
- **Voice Input** - Speech-to-text integration
- **Rate Limiting** - API rate limiting and quotas

### Low Priority

- **Analytics Dashboard** - Usage statistics
- **Performance Monitoring** - APM integration
- **Deployment Guides** - Platform-specific guides
- **Docker Optimization** - Multi-stage builds
- **CI/CD Pipeline** - Automated testing and deployment

### Documentation

- Improve existing documentation
- Add code examples
- Create video tutorials
- Translate documentation to other languages
- Add architecture diagrams

### Bug Fixes

Check the [Issues](https://github.com/yourusername/mini-chat-ollama/issues) page for:
- Bugs labeled `good first issue`
- Bugs labeled `help wanted`

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues
3. Open a new issue with the `question` label
4. Join our community discussions

## Recognition

Contributors will be:
- Listed in the README.md
- Credited in release notes
- Mentioned in the CHANGELOG.md

Thank you for contributing to Mini Chat Ollama! 🎉
