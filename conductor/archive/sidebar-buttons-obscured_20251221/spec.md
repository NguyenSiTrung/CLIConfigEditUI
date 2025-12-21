# Specification: Sidebar Toggle Button Obscuring Bug

## Overview

When viewing a file in the editor and then collapsing and expanding the left sidebar, the Format and Save buttons in the editor toolbar become obscured or hidden.

## Problem Description

**Steps to Reproduce:**
1. Open the application
2. Select a configuration file to view in the editor
3. Collapse the left sidebar using the toggle button
4. Expand the left sidebar again
5. Observe the Format and Save buttons in the editor toolbar

**Expected Behavior:**
The Format and Save buttons should remain fully visible and accessible after sidebar collapse/expand operations.

**Actual Behavior:**
The Format and Save buttons are obscured after collapsing and expanding the sidebar.

## Root Cause Analysis

The issue is likely caused by one of the following:
1. The Monaco Editor's `automaticLayout` not being triggered on sidebar width changes
2. CSS flexbox layout not properly recalculating after the sidebar transition
3. The toolbar container not responding correctly to parent container resize events

## Affected Components

- [src/components/config-editor.tsx](../../../src/components/config-editor.tsx) - Editor toolbar with Format/Save buttons (lines 196-232)
- [src/components/sidebar/index.tsx](../../../src/components/sidebar/index.tsx) - Sidebar collapse/expand logic (lines 121-145)
- [src/App.tsx](../../../src/App.tsx) - Parent layout container (lines 431-455)

## Functional Requirements

### FR1: Button Visibility
The Format and Save buttons in the editor toolbar must remain visible and accessible regardless of sidebar state changes.

### FR2: Layout Stability
The editor toolbar should properly respond to sidebar width changes without layout shifts that obscure UI elements.

### FR3: Transition Handling
During and after sidebar collapse/expand transitions, the editor layout should recalculate correctly.

## Acceptance Criteria

- [ ] Format and Save buttons visible after collapsing sidebar
- [ ] Format and Save buttons visible after expanding sidebar
- [ ] Buttons remain clickable and functional after sidebar toggle
- [ ] No visual glitches during sidebar transition
- [ ] Works correctly on repeated collapse/expand cycles

## Out of Scope

- Changing sidebar animation duration
- Modifying button styles or positions
- Adding new toolbar buttons
