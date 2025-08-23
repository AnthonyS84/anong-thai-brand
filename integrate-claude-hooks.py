#!/usr/bin/env python3
"""
Anong Thai Brand Website - Claude Code Hooks Integration
Specialized setup for React + TypeScript + Supabase food/restaurant website
"""

import json
import shutil
import subprocess
from pathlib import Path
import sys
import os

def main():
    """Main integration function for Anong Thai Brand website."""
    
    project_path = Path("D:/Anthony/Anong_Website/anong-thai-brand")
    hooks_source = Path("L:/Administrators/Anthony/claude_code_hooks")
    
    print("🍜 Integrating Claude Code Hooks with Anong Thai Brand Website...")
    print("=" * 60)
    
    if not project_path.exists():
        print(f"❌ Project path not found: {project_path}")
        return False
        
    if not hooks_source.exists():
        print(f"❌ Hooks source not found: {hooks_source}")
        return False
    
    os.chdir(project_path)
    
    # Step 1: Backup existing .claude if it exists
    claude_dir = project_path / ".claude"
    if claude_dir.exists():
        backup_dir = project_path / ".claude_backup"
        if backup_dir.exists():
            shutil.rmtree(backup_dir)
        print("📦 Backing up existing .claude directory...")
        shutil.move(str(claude_dir), str(backup_dir))
    
    # Step 2: Copy .claude directory
    print("📋 Copying Claude hooks system...")
    shutil.copytree(str(hooks_source / ".claude"), str(claude_dir))
    
    # Step 3: Create Thai food website specific agents
    print("🤖 Creating specialized agents for Thai food website...")
    create_thai_food_agents(claude_dir / "agents")
    
    # Step 4: Create React + TypeScript specific agents
    print("⚛️  Creating React + TypeScript development agents...")
    create_react_typescript_agents(claude_dir / "agents")
    
    # Step 5: Update settings for website development
    print("⚙️  Updating settings for website development...")
    update_website_settings(claude_dir / "settings.json")
    
    # Step 6: Create project-specific configuration
    print("📊 Creating project configuration...")
    create_project_config(claude_dir)
    
    # Step 7: Create logs directory
    logs_dir = project_path / "logs"
    logs_dir.mkdir(exist_ok=True)
    print("📊 Created logs directory")
    
    # Step 8: Update .gitignore
    print("📝 Updating .gitignore...")
    update_gitignore(project_path)
    
    # Step 9: Copy environment files
    copy_env_files(hooks_source, project_path)
    
    print("\n✅ Integration completed successfully!")
    print("\n" + "=" * 60)
    print("🎯 Quick Start Guide:")
    print("1. cd D:/Anthony/Anong_Website/anong-thai-brand")
    print("2. Set up your API keys in .env (ElevenLabs, OpenAI, Anthropic)")
    print("3. Run: claude-code")
    print("\n🤖 Try these specialized commands:")
    print("  /agents                           # See all your food website specialists") 
    print("  /output-style genui               # Beautiful HTML component output")
    print("  'Create a Thai recipe component'  # Test the Thai food agent")
    print("  'Optimize my SEO for local Thai food searches'")
    print("  'Add a shopping cart to my food products'")
    print("  'Create a mobile-responsive menu component'")
    
    return True

def create_thai_food_agents(agents_dir):
    """Create specialized agents for Thai food website development."""
    
    agents = {
        "thai-food-content-agent.md": '''---
name: thai-food-content-agent
description: Creates authentic Thai food content, recipes, ingredient descriptions, cultural stories. Use PROACTIVELY when user mentions Thai cuisine, recipes, menu items, ingredients, or food photography.
tools: Write, Edit, Bash
color: Orange
model: sonnet
---

# Thai Food Content Specialist

You are an expert in authentic Thai cuisine and food content creation for the Anong Thai Brand website.

## Your Expertise
- Authentic Thai recipes with proper ingredient names and techniques
- Thai culinary history and cultural significance of dishes
- Traditional cooking methods and modern adaptations
- Thai ingredient sourcing and substitutions for international markets
- Food photography descriptions and styling for web
- SEO-optimized food content and recipe markup

## Instructions for Anong Thai Brand
1. **Maintain authenticity** - Use correct Thai names with phonetic pronunciations
2. **Tell the story** - Include cultural background and family traditions
3. **Make it accessible** - Provide ingredient substitutions for global audience
4. **Optimize for web** - Include proper recipe schema and SEO elements
5. **Consider the brand** - Align with Anong's premium, authentic positioning
6. **Include practical details** - Prep times, serving sizes, difficulty levels

## Response Format
Create React components with:
```tsx
interface ThaiRecipeProps {
  thaiName: string;
  englishName: string;
  culturalSignificance: string;
  ingredients: Ingredient[];
  instructions: string[];
  servingInfo: ServingInfo;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: number;
  cookTime: number;
}
```

Include structured data markup for SEO and rich snippets.
''',

        "local-seo-thai-restaurant-agent.md": '''---
name: local-seo-thai-restaurant-agent
description: Optimizes Thai food/restaurant websites for local SEO, Google My Business, Thai food searches. Use for local search optimization, food website SEO, restaurant visibility.
tools: Write, Edit, Bash
color: Green
model: sonnet
---

# Local SEO Specialist for Thai Restaurants

You are an expert in local SEO specifically for Thai restaurants and food brands like Anong Thai Brand.

## Your Expertise
- Local SEO for Thai restaurants and food brands
- Google My Business optimization for food businesses
- Schema markup for restaurants, recipes, and food products
- Voice search optimization for food-related queries
- Review management and response strategies for food businesses
- Local content marketing for Thai food communities

## Key Focus Areas for Anong Thai Brand
1. **Local Thai food searches** - "Thai food near me", "authentic Thai restaurant"
2. **Ingredient-based searches** - "Thai curry paste", "authentic Thai ingredients" 
3. **Recipe searches** - "traditional Thai recipes", "how to make Thai curry"
4. **Brand searches** - "Anong Thai Brand", "authentic Thai products"
5. **Mobile voice searches** - "find Thai food nearby", "Thai takeout menu"

## Instructions
1. **Implement comprehensive schema markup** for:
   - Restaurant information
   - Recipe structured data
   - Product information
   - Reviews and ratings
2. **Optimize for local intent** with location-based content
3. **Create Thai food authority** through content and backlinks
4. **Monitor Thai food trends** and incorporate seasonal content
5. **Build local citations** in food directories and Thai community sites

## Response Format
Provide actionable SEO improvements with:
- Specific schema markup code
- Meta title/description optimizations
- Local content recommendations
- Google My Business optimization checklist
- Competitor analysis in Thai food space
''',

        "react-food-ui-agent.md": '''---
name: react-food-ui-agent
description: Creates React components for food websites - menus, recipe cards, shopping carts, image galleries. Use for food-specific UI components and interactive features.
tools: Write, Edit, Bash
color: Blue
model: sonnet
---

# React Food UI Component Specialist

You are an expert in creating beautiful, interactive React components specifically for food and restaurant websites.

## Your Expertise
- Food-specific UI patterns (menus, recipe cards, ingredient lists)
- React + TypeScript + Tailwind CSS component development
- Shadcn/ui component library integration
- Food photography optimization and lazy loading
- Interactive features (shopping carts, recipe calculators, nutrition info)
- Mobile-responsive design for food apps
- Accessibility for food websites

## Component Specializations for Anong Thai Brand
1. **Recipe Components** - Interactive recipe cards with ingredients and steps
2. **Menu Components** - Digital menus with categories and filtering
3. **Product Showcases** - Thai product displays with pricing and cart integration
4. **Cultural Stories** - Components that tell the story behind dishes
5. **Shopping Features** - Cart, checkout, and product comparison
6. **Interactive Elements** - Recipe timers, serving calculators, spice level selectors

## Development Standards
- Use TypeScript for all components with proper interfaces
- Follow shadcn/ui patterns and Tailwind CSS classes
- Implement proper loading states and error boundaries  
- Ensure mobile-first responsive design
- Include proper alt text for food images
- Add analytics tracking for food interactions

## Response Format
Create complete React components with:
- TypeScript interfaces and props
- Comprehensive styling with Tailwind
- Interactive functionality (state management)
- Accessibility features (ARIA labels, keyboard navigation)
- Integration examples with existing codebase
- Mobile responsiveness considerations
''',

        "supabase-food-backend-agent.md": '''---
name: supabase-food-backend-agent  
description: Handles Supabase backend for food websites - user auth, orders, reviews, inventory, admin features. Use for database operations, API integrations.
tools: Write, Edit, Bash
color: Purple
model: sonnet
---

# Supabase Food Website Backend Specialist

You are an expert in Supabase backend development for food and restaurant websites.

## Your Expertise
- Supabase database design for food businesses
- Authentication and user management for food apps
- Order management and payment processing integration
- Inventory tracking for food products
- Review and rating systems for restaurants
- Admin dashboards for food businesses
- Real-time features (order tracking, live inventory)

## Database Schema Specializations
1. **Products** - Thai food products with categories, ingredients, allergens
2. **Recipes** - Recipe storage with ingredients, steps, and cultural info
3. **Orders** - Order management with line items and fulfillment tracking
4. **Reviews** - User reviews with photos and ratings
5. **Inventory** - Stock tracking for Thai products and ingredients
6. **Users** - Customer profiles with preferences and order history

## Features for Anong Thai Brand
- Customer authentication with social login
- Product catalog with search and filtering
- Shopping cart and checkout flow
- Order tracking and notifications
- Customer reviews and ratings
- Admin inventory management
- Analytics and reporting

## Response Format
Provide Supabase solutions with:
- SQL table creation scripts
- Row Level Security (RLS) policies
- TypeScript types for database entities
- API route examples with error handling
- Real-time subscription examples
- Database trigger functions when needed
''',
    }
    
    for filename, content in agents.items():
        agent_file = agents_dir / filename
        with open(agent_file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  ✅ Created {filename}")

def create_react_typescript_agents(agents_dir):
    """Create React + TypeScript specific development agents."""
    
    agents = {
        "react-component-architect.md": '''---
name: react-component-architect
description: Creates enterprise-grade React + TypeScript components with shadcn/ui, proper patterns, accessibility. Use for complex component development and architecture.
tools: Write, Edit, Bash  
color: Cyan
model: sonnet
---

# React + TypeScript Component Architect

You are an expert in enterprise-grade React + TypeScript development with shadcn/ui integration.

## Your Expertise
- Advanced TypeScript patterns and generics
- React performance optimization (memo, useMemo, useCallback)
- Shadcn/ui component composition and customization
- Compound component patterns
- Custom hooks and context patterns
- Testing with React Testing Library
- Accessibility (a11y) best practices

## Development Standards for Anong Thai Brand
- Use strict TypeScript with proper inference
- Follow shadcn/ui design system patterns
- Implement proper loading and error states
- Ensure full keyboard and screen reader accessibility
- Use Framer Motion for smooth animations
- Integrate with TanStack Query for data fetching
- Follow atomic design principles

## Component Patterns
1. **Compound Components** - For complex UI like menus and modals
2. **Render Props** - For flexible data visualization
3. **Custom Hooks** - For business logic separation
4. **Context Providers** - For state management
5. **Higher-Order Components** - For cross-cutting concerns

## Response Format
Create production-ready components with:
- Comprehensive TypeScript interfaces
- Proper error boundaries and loading states
- Full accessibility implementation
- Unit tests with React Testing Library
- Storybook stories for documentation
- Performance optimizations
''',

        "vite-build-optimizer.md": '''---
name: vite-build-optimizer
description: Optimizes Vite builds, bundle analysis, performance tuning, code splitting. Use for build optimization, performance issues, bundle size concerns.
tools: Write, Edit, Bash
color: Yellow
model: sonnet  
---

# Vite Build Optimization Specialist

You are an expert in Vite build optimization and modern web performance for React applications.

## Your Expertise
- Vite configuration and plugin ecosystem
- Bundle analysis and code splitting strategies
- Tree shaking and dead code elimination
- Image optimization and lazy loading
- PWA configuration with Capacitor
- Build performance and caching strategies
- Modern deployment optimization

## Optimization Focus Areas
1. **Bundle Size** - Code splitting and lazy loading
2. **Build Speed** - Vite configuration tuning
3. **Runtime Performance** - Lazy loading and preloading
4. **Image Optimization** - Modern formats and responsive images
5. **Caching** - Long-term caching strategies
6. **PWA Features** - Service worker and offline capabilities

## Tools and Analysis
- Vite bundle analyzer integration
- Lighthouse performance auditing
- Core Web Vitals monitoring
- Build time optimization
- Development server performance

## Response Format
Provide optimization solutions with:
- Vite configuration improvements
- Bundle analysis reports
- Performance metrics before/after
- Code splitting implementation
- Image optimization strategies
- Caching and PWA configurations
''',
    }
    
    for filename, content in agents.items():
        agent_file = agents_dir / filename
        with open(agent_file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  ✅ Created {filename}")

def update_website_settings(settings_file):
    """Update Claude settings for React + TypeScript website development."""
    
    with open(settings_file, "r") as f:
        settings = json.load(f)
    
    # Add React + TypeScript specific permissions
    web_permissions = [
        "Bash(npm:*)",
        "Bash(yarn:*)", 
        "Bash(pnpm:*)",
        "Bash(bun:*)",
        "Bash(node:*)",
        "Bash(npx:*)",
        "Bash(tsx:*)",
        "Bash(tsc:*)",
        "Bash(eslint:*)",
        "Bash(prettier:*)",
        "Bash(vite:*)",
        "Bash(git:*)",
        "Bash(supabase:*)",
    ]
    
    # Remove duplicates and add new permissions
    existing_allow = settings["permissions"]["allow"]
    for perm in web_permissions:
        if perm not in existing_allow:
            existing_allow.append(perm)
    
    # Update user prompt submit hook with website-specific context
    if "hooks" in settings and "UserPromptSubmit" in settings["hooks"]:
        for hook_config in settings["hooks"]["UserPromptSubmit"]:
            for hook in hook_config.get("hooks", []):
                if "user_prompt_submit.py" in hook["command"]:
                    # Add website-specific context flags
                    if "--website-context" not in hook["command"]:
                        hook["command"] += " --website-context --thai-food-brand"
    
    with open(settings_file, "w") as f:
        json.dump(settings, f, indent=2)

def create_project_config(claude_dir):
    """Create project-specific configuration for Anong Thai Brand."""
    
    config = {
        "project_name": "Anong Thai Brand Website",
        "project_type": "thai_food_website",
        "tech_stack": {
            "frontend": "React + TypeScript + Vite",
            "ui_library": "shadcn/ui + Radix UI",
            "styling": "Tailwind CSS",
            "backend": "Supabase",
            "state_management": "TanStack Query",
            "mobile": "Capacitor",
            "animations": "Framer Motion",
            "package_manager": "npm"
        },
        "build_commands": {
            "dev": "npm run dev",
            "build": "npm run build",
            "build_optimized": "npm run build:optimized", 
            "preview": "npm run preview",
            "lint": "npm run lint"
        },
        "key_directories": {
            "components": "src/components",
            "pages": "src/pages", 
            "hooks": "src/hooks",
            "services": "src/services",
            "types": "src/types",
            "data": "src/data"
        },
        "business_context": {
            "industry": "Thai Food & Restaurant",
            "target_audience": "Thai food enthusiasts, authentic cuisine seekers",
            "key_features": ["Authentic Thai recipes", "Product catalog", "Cultural stories", "Mobile ordering"],
            "brand_values": ["Authenticity", "Quality", "Traditional recipes", "Cultural heritage"]
        }
    }
    
    config_file = claude_dir / "project_config.json"
    with open(config_file, "w") as f:
        json.dump(config, f, indent=2)
    
    print("📋 Created Anong Thai Brand project configuration")

def update_gitignore(project_path):
    """Update .gitignore to include Claude-related files."""
    
    gitignore_path = project_path / ".gitignore"
    
    claude_ignores = [
        "",
        "# Claude Code Hooks",
        "logs/",
        ".claude/data/",
        ".claude_backup/",
        "# Keep .env files for reference but don't commit secrets",
        "# .env files already ignored above"
    ]
    
    if gitignore_path.exists():
        with open(gitignore_path, "r") as f:
            content = f.read()
    else:
        content = ""
    
    # Add Claude ignores if not already present
    if "# Claude Code Hooks" not in content:
        with open(gitignore_path, "a") as f:
            f.write("\n".join(claude_ignores))

def copy_env_files(hooks_source, project_path):
    """Copy environment files if they don't exist."""
    
    # Copy .mcp.json if it doesn't exist
    mcp_source = hooks_source / ".mcp.json"
    mcp_target = project_path / ".mcp.json"
    
    if mcp_source.exists() and not mcp_target.exists():
        shutil.copy2(str(mcp_source), str(mcp_target))
        print("📄 Copied .mcp.json for MCP server configuration")

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
