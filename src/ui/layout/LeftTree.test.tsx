import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { LeftTree } from './LeftTree';
import { dummyManifest } from '../pages/dummyFixture';
import { useUiStore } from '../../store/useUiStore';

describe('LeftTree', () => {
  afterEach(() => {
    useUiStore.setState({ selectedItemId: null });
  });

  it('disables locked items and marks them with a lock label', () => {
    render(<LeftTree manifest={dummyManifest} lockedItemIds={new Set(['lab-2'])} completionPct={{}} />);

    const lockedButton = screen.getByRole('button', { name: /locked/i });
    expect(lockedButton).toBeDisabled();

    const unlockedButton = screen.getByRole('button', { name: 'Lab 0 — Foundation' });
    expect(unlockedButton).toBeEnabled();
  });

  it('selects an item on click and reflects it via aria-current', async () => {
    const user = userEvent.setup();
    render(<LeftTree manifest={dummyManifest} lockedItemIds={new Set()} completionPct={{}} />);

    const button = screen.getByRole('button', { name: 'Lab 1 — First Tool Call' });
    await user.click(button);

    expect(button).toHaveAttribute('aria-current', 'true');
  });
});
