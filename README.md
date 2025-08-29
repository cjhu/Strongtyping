# StrongTyping Chat Interface

A chat interface with "strongtyping" functionality that allows users to insert objects (employees, departments, payruns) into their messages using the "@" symbol.

## Features

### Core Functionality
- **@ Trigger**: Type "@" in the chat input to open the object insertion dropdown
- **Categories**: Browse universal objects (Employees, Departments) and app-specific objects (Pay Runs)
- **Frequently Used**: Quick access to commonly used objects
- **Type-ahead Search**: Start typing after "@" to search across all categories
- **Drill-down Navigation**: Click on categories to browse all objects within them

### User Experience
- **Smart Search**: Shows first 5 results per category when searching
- **Category Navigation**: Click category headers to see all matching results
- **Drill-down Navigation**: Press Tab to drill into categories, Backspace to go back
- **Auto-Selected First Item**: First dropdown item is automatically highlighted for immediate selection
- **Visual Tab Indicators**: → arrow icons on categories show Tab key functionality
- **Object Insertion**: Selected objects are inserted as styled chips in the message
- **Chip Visualization**: Objects appear as colored badges with icons (👤 employees, 🏢 departments, 💰 payruns)
- **Conflict-free Input**: Dropdown navigation doesn't interfere with message submission
- **Keyboard Navigation**: Full keyboard accessibility with clear shortcuts
- **Smart Positioning**: Dropdown appears above input (like Cursor) with automatic fallback to below when needed
- **Visual Connection**: Arrow pointer shows clear connection between input and dropdown
- **Intelligent Disambiguation**: Detects object references even without @ symbol and provides suggestions
- **Conversational AI Chat**: Answers natural language questions about employees, departments, and payroll with ambiguity resolution within chat

## How to Use

1. **Start typing**: Begin typing your message in the chat input
2. **Trigger dropdown**: Type "@" anywhere in your message to open the object selector
3. **Browse categories**: See all available categories and frequently used objects
4. **Search**: Type letters after "@" to search (e.g., "@m" shows all objects starting with "m")
5. **Navigate**: Use mouse or arrow keys to select objects
6. **Insert**: Click or press Enter to insert the selected object into your message

## Technical Implementation

### Components
- `ChatRail`: Main chat interface container
- `ChatInput`: Text input with @ trigger detection
- `StrongTypingDropdown`: Object selection dropdown with search and navigation
- `ChatMessages`: Message display component

### Key Features
- Real-time @ detection and dropdown positioning
- Cross-category search with result limiting
- Keyboard accessibility (arrow keys, Enter, Escape)
- Visual feedback for selected items
- Responsive design with proper scrolling

## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Scenarios

### 1. Basic Navigation
- Type `@` → Shows categories and frequently used items
- Click any category to drill down and browse all items
- Use arrow keys + Enter to navigate and select

### 2. Type-ahead Search Examples
Try these search examples:
- `@j` → Shows 8+ items starting with "J" (John Johnson, Jane Jackson, James Jordan, etc.)
- `@mar` → Shows "Marketing", "Maria Martinez", "Mark Mitchell"
- `@pay` → Shows all payrun items
- `@eng` → Shows "Engineering" department

### 3. Smart Positioning Demo
- **At bottom of page**: Dropdown appears above input automatically
- **At top of page**: Dropdown appears below input as fallback
- **Near edges**: Dropdown adjusts to stay within viewport
- **Visual cue**: Arrow pointer shows connection to input field

### 4. Category Drill-down
- Type `@` then click "Employees" → See all 50 employees
- Type `@` then click "Departments" → See all 15 departments
- Type `@` then click "Pay Runs" → See all 17 payroll runs

### 5. Keyboard Navigation
- **↑↓ arrows**: Navigate through results (works in all modes including drill-down)
- **Enter**: Select highlighted item (first item is auto-selected!)
- **Tab**: Drill down into category (when category is selected)
- **⌫ (Backspace)**: Go back when in drill-down mode
- **Escape**: Close dropdown

**Note**: When dropdown is active, input submission is disabled to prevent conflicts.
**Tip**: First item is automatically highlighted - just press Enter without navigating!

**Visual Indicators**: → arrow icons on the right side of categories show users they can press Tab to drill down.

**Drill-down Navigation**: After drilling down into a category (using Tab), arrow keys work seamlessly to navigate through all items in that category.

### 7. Intelligent Disambiguation
- **Smart Detection**: Automatically detects employee names, department names, and payrun references
- **Visual Highlighting**: Detected terms are highlighted with yellow background and border
- **Click to Suggest**: Click on highlighted words to see relevant object suggestions
- **Seamless Conversion**: Select from suggestions to convert plain text to formatted chips

### 8. Conversational AI Chat
- **Natural Language Queries**: Ask questions like "What's Max's latest paycheck?" or "Who manages Engineering?"
- **Ambiguity Resolution**: When multiple matches exist (like multiple employees named Max), presents clickable options within chat
- **Rich Responses**: Provides detailed information about employees, departments, and payroll data as chat messages
- **Smart Query Detection**: Automatically recognizes questions about HR/payroll topics
- **Conversational Flow**: AI responses appear as part of the chat conversation with proper formatting
- **Interactive Options**: Click numbered options in chat to resolve ambiguity
- **Contextual Information**: Shows department, salary, manager, and other relevant details
- **Intelligent Clarification**: Only asks for clarification when needed - skips for strong-typed messages

### 6. Real-world Examples
- `Can you review 👤John Johnson's performance?`
- `The 🏢Engineering team did great work on this project`
- `Please process the 💰Monthly Payroll - June 2024`
- `who is sarah` → AI asks to choose from multiple Sarahs
- `who is {{sarah johnson}}` → AI responds directly (already clarified)

#### AI Query Examples:
- **"What's Max's latest paycheck?"** → Shows 3 Maxes to choose from in chat
- **"Who manages the Engineering department?"** → Direct answer in chat
- **"What's the total payroll for January?"** → Payroll summary in chat
- **"Tell me about John Johnson's role"** → Detailed employee information in chat
- **"max's salary"** → Works with lowercase names
- **"Who is Sarah?"** → Finds Sarah Johnson
- **"About Jennifer Davis"** → Detailed employee info
- **"Engineering department"** → Department information
- **"Who manages Marketing?"** → Manager lookup
- **Submit with disambiguation dropdown** → Clean state, no stuck dropdown
- **Fixed race condition** → Dropdown no longer flashes and disappears
- **"who is {{sarah johnson}}"** → Strong-typed, no AI clarification needed
- **Smart AI responses** → Strong-typed messages skip AI clarification

## Mock Data

The application includes comprehensive mock data for demos:
- **Employees**: 50 diverse names across the alphabet (A-Z) for great typeahead demos
- **Departments**: 15 different departments including Engineering, Marketing, Sales, HR, Finance, IT, etc.
- **Pay Runs**: 17 different payroll runs including monthly payrolls, bonuses, commissions, and special runs

## Future Enhancements

- API integration for real data
- More object types based on app context
- Advanced search with fuzzy matching
- Recent/frequent object tracking
- Multi-object selection
- Rich object previews
