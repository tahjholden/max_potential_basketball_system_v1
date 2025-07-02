# Universal Components System

This document outlines the new unified component system that standardizes buttons, modals, and other UI elements across the application.

## 🎯 Overview

The Universal Components System provides:
- **Consistent Design**: All components use the same design tokens and color scheme
- **Type Safety**: Full TypeScript support with proper prop types
- **Flexibility**: Multiple variants and sizes for different use cases
- **Accessibility**: Built-in accessibility features and keyboard navigation
- **Performance**: Optimized components with proper React patterns

## 🎨 Design Tokens

All components use centralized design tokens from `lib/design-tokens.ts`:

```typescript
import { colors, spacing, typography } from '@/lib/design-tokens';

// Primary brand colors
colors.gold[500]    // #C2B56B - Primary brand gold
colors.danger[500]  // #A22828 - Brand red
colors.success[500] // #22c55e - Success green
colors.warning[500] // #f59e0b - Warning yellow
colors.archive[500] // #64748b - Archive gray
colors.gray[500]    // #6b7280 - Neutral gray
```

## 🔘 Universal Buttons

### Import
```typescript
import UniversalButton from '@/components/ui/UniversalButton';
```

### Available Button Types

#### Primary Buttons (Solid)
```typescript
// Gold primary button
<UniversalButton.Primary onClick={handleClick}>
  Add Player
</UniversalButton.Primary>

// Danger primary button
<UniversalButton.Danger onClick={handleDelete}>
  Delete Player
</UniversalButton.Danger>

// Success primary button
<UniversalButton.Success onClick={handleSave}>
  Save Changes
</UniversalButton.Success>

// Warning primary button
<UniversalButton.Warning onClick={handleArchive}>
  Archive Plan
</UniversalButton.Warning>
```

#### Secondary Buttons (Outline)
```typescript
// Gold secondary button
<UniversalButton.Secondary onClick={handleEdit}>
  Edit Player
</UniversalButton.Secondary>

// Danger outline button
<UniversalButton.DangerOutline onClick={handleDelete}>
  Delete
</UniversalButton.DangerOutline>

// Archive button
<UniversalButton.Archive onClick={handleArchive}>
  Archive
</UniversalButton.Archive>

// Gray neutral button
<UniversalButton.Gray onClick={handleCancel}>
  Cancel
</UniversalButton.Gray>
```

#### Text & Ghost Buttons
```typescript
// Text button (no background)
<UniversalButton.Text onClick={handleView}>
  View Details
</UniversalButton.Text>

// Ghost button (transparent)
<UniversalButton.Ghost onClick={handleClose}>
  Close
</UniversalButton.Ghost>
```

### Button Sizes
```typescript
<UniversalButton.Primary size="xs">Extra Small</UniversalButton.Primary>
<UniversalButton.Primary size="sm">Small</UniversalButton.Primary>
<UniversalButton.Primary size="md">Medium (default)</UniversalButton.Primary>
<UniversalButton.Primary size="lg">Large</UniversalButton.Primary>
<UniversalButton.Primary size="xl">Extra Large</UniversalButton.Primary>
```

### Loading States
```typescript
<UniversalButton.Primary loading>
  Saving...
</UniversalButton.Primary>

<UniversalButton.Danger loading>
  Deleting...
</UniversalButton.Danger>
```

### Custom Button (Base Component)
```typescript
<UniversalButton.Base
  color="gold"
  variant="outline"
  size="lg"
  loading={false}
  onClick={handleClick}
>
  Custom Button
</UniversalButton.Base>
```

## 🪟 Universal Modals

### Import
```typescript
import UniversalModal, { Modal } from '@/components/ui/UniversalModal';
```

### Available Modal Types

#### Basic Modals
```typescript
// Basic content modal
<UniversalModal.Basic
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Player Details"
  description="View and manage player information"
  variant="default"
  size="md"
>
  <div>Modal content goes here</div>
</UniversalModal.Basic>

// Info modal
<Modal.Info
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Information"
  description="This is an informational modal"
>
  <div>Info content</div>
</Modal.Info>
```

#### Confirmation Modals
```typescript
// Delete confirmation
<Modal.Delete
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Player"
  description="Are you sure you want to delete this player? This action cannot be undone."
  onConfirm={handleDelete}
  confirmText="Delete Player"
  loading={isDeleting}
/>

// Archive confirmation
<Modal.Archive
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Archive Plan"
  description="Are you sure you want to archive this plan? You can restore it later."
  onConfirm={handleArchive}
  confirmText="Archive Plan"
  loading={isArchiving}
/>

// Success confirmation
<Modal.Success
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Success"
  description="The operation completed successfully."
  onConfirm={handleContinue}
  confirmText="Continue"
/>

// Warning confirmation
<Modal.Warning
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Warning"
  description="This action may have unintended consequences. Are you sure you want to proceed?"
  onConfirm={handleProceed}
  confirmText="Proceed"
/>
```

#### Form Modals
```typescript
// Add form modal
<Modal.Add
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Add New Player"
  description="Enter the player's information below."
  onSubmit={handleSubmit}
  submitText="Add Player"
  loading={isSubmitting}
  disabled={!isValid}
>
  <div className="space-y-4">
    <input type="text" placeholder="First Name" />
    <input type="text" placeholder="Last Name" />
  </div>
</Modal.Add>

// Edit form modal
<Modal.Edit
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Edit Player"
  description="Update the player's information below."
  onSubmit={handleSubmit}
  submitText="Save Changes"
  loading={isSubmitting}
  disabled={!isValid}
>
  <div className="space-y-4">
    <input type="text" defaultValue="John" />
    <input type="text" defaultValue="Doe" />
  </div>
</Modal.Edit>
```

### Modal Variants
```typescript
// Different color variants
<UniversalModal.Basic variant="default">  // Gold theme
<UniversalModal.Basic variant="danger">   // Red theme
<UniversalModal.Basic variant="success">  // Green theme
<UniversalModal.Basic variant="warning">  // Yellow theme
<UniversalModal.Basic variant="archive">  // Gray theme
<UniversalModal.Basic variant="gray">     // Neutral gray
```

### Modal Sizes
```typescript
<UniversalModal.Basic size="sm">  // Small (max-w-sm)
<UniversalModal.Basic size="md">  // Medium (max-w-md) - default
<UniversalModal.Basic size="lg">  // Large (max-w-lg)
<UniversalModal.Basic size="xl">  // Extra Large (max-w-xl)
```

## 🎯 Common Usage Patterns

### Delete Pattern
```typescript
// Button
<UniversalButton.Danger size="sm" onClick={() => setDeleteModalOpen(true)}>
  Delete Player
</UniversalButton.Danger>

// Modal
<Modal.Delete
  open={deleteModalOpen}
  onOpenChange={setDeleteModalOpen}
  title="Delete Player"
  description="Are you sure you want to delete John Doe? This action cannot be undone."
  onConfirm={handleDeletePlayer}
  confirmText="Delete Player"
  loading={isDeleting}
/>
```

### Add Pattern
```typescript
// Button
<UniversalButton.Primary size="sm" onClick={() => setAddModalOpen(true)}>
  Add Player
</UniversalButton.Primary>

// Modal
<Modal.Add
  open={addModalOpen}
  onOpenChange={setAddModalOpen}
  title="Add New Player"
  description="Enter the player's information below."
  onSubmit={handleAddPlayer}
  submitText="Add Player"
  loading={isSubmitting}
  disabled={!formValid}
>
  <PlayerForm />
</Modal.Add>
```

### Archive Pattern
```typescript
// Button
<UniversalButton.Archive size="sm" onClick={() => setArchiveModalOpen(true)}>
  Archive Plan
</UniversalButton.Archive>

// Modal
<Modal.Archive
  open={archiveModalOpen}
  onOpenChange={setArchiveModalOpen}
  title="Archive Development Plan"
  description="Are you sure you want to archive this plan? You can restore it later."
  onConfirm={handleArchivePlan}
  confirmText="Archive Plan"
  loading={isArchiving}
/>
```

### Edit Pattern
```typescript
// Button
<UniversalButton.Secondary size="sm" onClick={() => setEditModalOpen(true)}>
  Edit Player
</UniversalButton.Secondary>

// Modal
<Modal.Edit
  open={editModalOpen}
  onOpenChange={setEditModalOpen}
  title="Edit Player"
  description="Update the player's information below."
  onSubmit={handleUpdatePlayer}
  submitText="Save Changes"
  loading={isUpdating}
  disabled={!formValid}
>
  <PlayerForm initialData={playerData} />
</Modal.Edit>
```

## 🔄 Migration Guide

### From Legacy Buttons
```typescript
// Old way
<button className="bg-[#facc15] text-black px-4 py-2 rounded">
  Add Player
</button>

// New way
<UniversalButton.Primary>
  Add Player
</UniversalButton.Primary>
```

### From Legacy Modals
```typescript
// Old way
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div className="bg-zinc-800 p-6 rounded-lg">
    <h2>Delete Player</h2>
    <p>Are you sure?</p>
    <button onClick={handleDelete}>Delete</button>
  </div>
</div>

// New way
<Modal.Delete
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Player"
  description="Are you sure you want to delete this player?"
  onConfirm={handleDelete}
/>
```

## 🎨 Customization

### Custom Button Colors
```typescript
<UniversalButton.Base
  color="custom"
  variant="outline"
  className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
>
  Custom Blue Button
</UniversalButton.Base>
```

### Custom Modal Styling
```typescript
<UniversalModal.Basic
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Custom Modal"
  variant="default"
  size="lg"
>
  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg">
    Custom styled content
  </div>
</UniversalModal.Basic>
```

## 🧪 Testing

### Button Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import UniversalButton from '@/components/ui/UniversalButton';

test('Primary button renders correctly', () => {
  const handleClick = jest.fn();
  render(
    <UniversalButton.Primary onClick={handleClick}>
      Test Button
    </UniversalButton.Primary>
  );
  
  const button = screen.getByRole('button', { name: /test button/i });
  expect(button).toBeInTheDocument();
  
  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Modal Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/ui/UniversalModal';

test('Delete modal renders correctly', () => {
  const handleConfirm = jest.fn();
  const handleOpenChange = jest.fn();
  
  render(
    <Modal.Delete
      open={true}
      onOpenChange={handleOpenChange}
      title="Delete Player"
      description="Are you sure?"
      onConfirm={handleConfirm}
    />
  );
  
  expect(screen.getByText('Delete Player')).toBeInTheDocument();
  expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  fireEvent.click(deleteButton);
  expect(handleConfirm).toHaveBeenCalledTimes(1);
});
```

## 📋 Best Practices

1. **Use Semantic Colors**: Choose button colors that match the action (danger for delete, success for save, etc.)
2. **Consistent Sizing**: Use `sm` for inline actions, `md` for primary actions, `lg` for important actions
3. **Loading States**: Always show loading states for async operations
4. **Accessibility**: Use descriptive button text and modal titles
5. **Form Validation**: Disable submit buttons when forms are invalid
6. **Error Handling**: Provide clear error messages in modals
7. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible

## 🔗 Related Files

- `lib/design-tokens.ts` - Design system tokens
- `components/ui/UniversalButton.tsx` - Universal button system
- `components/ui/UniversalModal.tsx` - Universal modal system
- `components/ui/gold-modal.tsx` - Base modal components
- `components/ui/UniversalComponentsExample.tsx` - Usage examples 