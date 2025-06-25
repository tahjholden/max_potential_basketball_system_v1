# MP Player Development - Modularization System

This document outlines the comprehensive modularization system implemented for the MP Player Development application. The system provides consistent, reusable components and utilities that maintain the brand's minimal elegance with gold accents.

## 🎯 Overview

The modularization system consists of:
- **Core Components**: Reusable UI components with consistent styling
- **Utility Functions**: Common operations and formatting functions
- **Layout Components**: Standardized layout patterns
- **State Management**: Consistent state handling patterns

## 🧩 Core Components

### EntityListPane
A generic list component for displaying entities with search, selection, and actions.

```tsx
import EntityListPane from "@/components/EntityListPane";

<EntityListPane
  title="Players"
  items={players}
  selectedId={selectedPlayerId}
  onSelect={handlePlayerSelect}
  actions={<EntityButton color="gold">Add Player</EntityButton>}
  searchPlaceholder="Search players..."
  renderItem={renderPlayerItem}
/>
```

**Features:**
- Built-in search functionality
- Custom item rendering
- Action buttons
- Consistent styling with gold accents

### EntityButton
Standardized action buttons with consistent styling and color variants.

```tsx
import EntityButton from "@/components/EntityButton";

<EntityButton color="gold" onClick={handleAdd}>
  Add Player
</EntityButton>

<EntityButton color="danger" onClick={handleDelete}>
  Delete Player
</EntityButton>
```

**Color Variants:**
- `gold`: Primary actions (create, edit, save)
- `danger`: Destructive actions (delete, remove)
- `archive`: Soft actions (archive, hide)
- `gray`: Secondary actions (cancel, back)

### StatusBadge
Consistent status indicators with icons and color coding.

```tsx
import StatusBadge from "@/components/StatusBadge";

<StatusBadge variant="success" size="sm" showIcon>
  Active
</StatusBadge>

<StatusBadge variant="warning" size="md">
  Needs Update
</StatusBadge>
```

**Variants:**
- `success`, `warning`, `danger`, `info`, `neutral`
- `pdp-active`, `pdp-inactive`
- `archived`, `active`, `inactive`

**Sizes:**
- `sm`, `md`, `lg`

### EmptyState
Comprehensive empty state system with variants and convenience components.

```tsx
import { 
  EmptyState, 
  NoPlayersEmptyState,
  SearchEmptyState,
  ErrorEmptyState 
} from "@/components/ui/EmptyState";

// Base component
<EmptyState
  variant="no-data"
  title="No Players Found"
  description="Add your first player to get started."
  action={{
    label: "Add Player",
    onClick: handleAddPlayer,
    color: "gold"
  }}
/>

// Convenience components
<NoPlayersEmptyState onAddPlayer={handleAddPlayer} />
<SearchEmptyState searchTerm="test" />
<ErrorEmptyState error="Failed to load data" onRetry={handleRetry} />
```

**Variants:**
- `default`, `search`, `no-data`, `welcome`, `error`, `loading`

### ArchivePane
Generic archive component for displaying archived items with sorting and actions.

```tsx
import { ArchivePane, PDPArchivePane } from "@/components/ui/ArchivePane";

// Generic archive
<ArchivePane
  title="Player Archive"
  items={archivedPlayers}
  sortOrder="desc"
  onSortOrderChange={handleSortChange}
  onRestore={handleRestore}
  onDelete={handleDelete}
  renderItemContent={renderPlayerDetails}
/>

// Specific convenience component
<PDPArchivePane
  pdps={archivedPdps}
  sortOrder={sortOrder}
  onSortOrderChange={setSortOrder}
  onRestore={handleRestorePDP}
/>
```

## 🎨 Modal System

### StandardModal
Unified modal system with color variants that match action buttons.

```tsx
import { StandardModal, ConfirmationModal, FormModal } from "@/components/ui/StandardModal";

// Base modal
<StandardModal
  isOpen={isOpen}
  onClose={onClose}
  title="Edit Player"
  color="gold"
  size="md"
>
  <form>...</form>
</StandardModal>

// Confirmation modal
<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Delete Player"
  message="Are you sure you want to delete this player?"
  color="danger"
/>

// Form modal
<FormModal
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
  title="Add Player"
  color="gold"
>
  <form>...</form>
</FormModal>
```

**Color Matching:**
- Gold modals for positive actions (create, edit)
- Red modals for destructive actions (delete)
- Gray modals for neutral actions (archive, cancel)

## 🛠️ Utility Functions

### Date Utilities
```tsx
import { 
  formatDate, 
  getRelativeTime, 
  isToday, 
  isThisWeek 
} from "@/lib/ui-utils";

formatDate("2024-01-15"); // "Jan 15, 2024"
getRelativeTime("2024-01-15"); // "2 days ago"
isToday("2024-01-15"); // false
```

### String Utilities
```tsx
import { 
  capitalizeWords, 
  truncateText, 
  getInitials, 
  formatName 
} from "@/lib/ui-utils";

capitalizeWords("john doe"); // "John Doe"
truncateText("Long text here", 10); // "Long text..."
getInitials("John Doe"); // "JD"
formatName("John", "Doe"); // "John Doe"
```

### Array Utilities
```tsx
import { 
  sortByDate, 
  sortByString, 
  filterBySearch, 
  groupBy 
} from "@/lib/ui-utils";

const sorted = sortByDate(players, "created_at", "desc");
const filtered = filterBySearch(players, "john", ["name", "email"]);
const grouped = groupBy(players, "team_id");
```

### Validation Utilities
```tsx
import { 
  isValidEmail, 
  isRequired, 
  hasMinLength, 
  hasMaxLength 
} from "@/lib/ui-utils";

isValidEmail("test@example.com"); // true
isRequired(""); // false
hasMinLength("password", 8); // true
```

## 📐 Layout Components

### ThreePaneLayout
Standard three-pane layout for main application views.

```tsx
import ThreePaneLayout from "@/components/ThreePaneLayout";

<ThreePaneLayout
  leftPane={<EntityListPane title="Players" items={players} />}
  centerPane={<PlayerDetail player={selectedPlayer} />}
  rightPane={<PDPArchivePane pdps={archivedPdps} />}
/>
```

### DashboardLayout
Specialized layout for dashboard views.

```tsx
import DashboardLayout from "@/components/DashboardLayout";

<DashboardLayout
  sidebar={<Navigation />}
  header={<TopNavBar />}
  content={<DashboardContent />}
/>
```

## 🎨 Styling Guidelines

### Color Palette
- **Primary Gold**: `#C2B56B` - Main brand color
- **Danger Red**: `#A22828` - Destructive actions
- **Archive Gray**: `#6B7280` - Soft actions
- **Background**: `#09090B` (zinc-950)
- **Surface**: `#18181B` (zinc-900)
- **Border**: `#27272A` (zinc-800)

### Typography
- **Headings**: Satoshi font family
- **Body**: System font stack
- **Code**: Monospace font

### Spacing
- **Container padding**: `p-4` (16px)
- **Component spacing**: `gap-4` (16px)
- **Section spacing**: `space-y-4` (16px)

## 🔄 State Management

### Loading States
```tsx
import { createLoadingState, withLoading } from "@/lib/ui-utils";

const [state, setState] = useState(createLoadingState());

const handleOperation = async () => {
  const result = await withLoading(
    asyncOperation,
    (loading) => setState(prev => ({ ...prev, loading })),
    (error) => setState(prev => ({ ...prev, error }))
  );
};
```

### Async States
```tsx
import { createAsyncState } from "@/lib/ui-utils";

const [state, setState] = useState(createAsyncState<Player[]>());
```

## 📱 Responsive Design

All components are built with responsive design in mind:
- Mobile-first approach
- Breakpoint-aware layouts
- Touch-friendly interactions
- Consistent spacing across devices

## 🧪 Testing Guidelines

### Component Testing
```tsx
import { render, screen } from "@testing-library/react";
import EntityButton from "@/components/EntityButton";

test("renders button with correct text", () => {
  render(<EntityButton>Test Button</EntityButton>);
  expect(screen.getByText("Test Button")).toBeInTheDocument();
});
```

### Utility Testing
```tsx
import { formatDate, isValidEmail } from "@/lib/ui-utils";

test("formats date correctly", () => {
  expect(formatDate("2024-01-15")).toBe("Jan 15, 2024");
});

test("validates email correctly", () => {
  expect(isValidEmail("test@example.com")).toBe(true);
});
```

## 🚀 Best Practices

### Component Usage
1. **Always use EntityButton** for actions instead of custom buttons
2. **Use StatusBadge** for all status indicators
3. **Implement EmptyState** for all empty data scenarios
4. **Use EntityListPane** for all list displays
5. **Match modal colors** to action button colors

### Code Organization
1. **Import utilities** from `@/lib/ui-utils`
2. **Use convenience components** when available
3. **Follow naming conventions** for props and functions
4. **Implement proper TypeScript** types for all components

### Performance
1. **Use debounce** for search inputs
2. **Implement proper loading states**
3. **Optimize re-renders** with React.memo when needed
4. **Use proper key props** for list items

## 📚 Migration Guide

### From Custom Components
```tsx
// Before
<button className="bg-gold text-black px-4 py-2 rounded">
  Add Player
</button>

// After
<EntityButton color="gold" onClick={handleAdd}>
  Add Player
</EntityButton>
```

### From Custom Empty States
```tsx
// Before
<div className="text-center py-8">
  <p>No players found</p>
  <button>Add Player</button>
</div>

// After
<NoPlayersEmptyState onAddPlayer={handleAdd} />
```

### From Custom Lists
```tsx
// Before
<div className="space-y-2">
  {players.map(player => (
    <div key={player.id}>{player.name}</div>
  ))}
</div>

// After
<EntityListPane
  title="Players"
  items={players}
  renderItem={(player) => <div>{player.name}</div>}
/>
```

## 🔧 Configuration

### Tailwind Configuration
The system uses custom Tailwind classes defined in `tailwind.config.ts`:
- Custom gold color palette
- Custom spacing scales
- Custom font families

### Component Configuration
Component variants and options are defined in their respective component files with TypeScript interfaces for type safety.

## 📈 Future Enhancements

### Planned Features
1. **Theme System**: Dark/light mode support
2. **Animation System**: Consistent micro-interactions
3. **Accessibility**: Enhanced ARIA support
4. **Internationalization**: Multi-language support
5. **Advanced Filtering**: Complex filter components

### Extension Points
1. **Custom Variants**: Easy addition of new component variants
2. **Plugin System**: Modular component extensions
3. **Design Tokens**: Centralized design system
4. **Component Library**: Storybook integration

## 🤝 Contributing

When adding new components or utilities:
1. Follow existing patterns and conventions
2. Add proper TypeScript types
3. Include comprehensive documentation
4. Add example usage
5. Update this README

## 📞 Support

For questions about the modularization system:
1. Check this documentation first
2. Review example components in `/components/ui/`
3. Consult the utility functions in `/lib/ui-utils.ts`
4. Check existing implementations in the app

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Maintainer**: MP Player Development Team 