import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import TaskPreviewCell from './TaskPreviewCell';

const renderCell = (props) => render(
  <TaskPreviewCell formatterIndex={2} setAdditionalData={vi.fn()} {...props} />,
);

describe('TaskPreviewCell', () => {
  it('shows the current value above the incoming one, which is bold', () => {
    const { container } = renderCell({
      formatter: (data) => data.name,
      itemData: { name: 'Old name' },
      incomingData: { name: 'New name' },
    });

    const [current, incoming] = container.querySelectorAll('p');
    expect(current).toHaveTextContent('Old name');
    expect(current).not.toHaveStyle({ fontWeight: 'bold' });
    expect(incoming).toHaveTextContent('New name');
    expect(incoming).toHaveStyle({ fontWeight: 'bold' });
  });

  it('shows only the incoming value for a task that creates something new', () => {
    const { container } = renderCell({
      formatter: (data) => data.name,
      itemData: {},
      incomingData: { name: 'New name' },
    });

    expect(container.querySelectorAll('p')).toHaveLength(1);
    expect(screen.getByText('New name')).toHaveStyle({ fontWeight: 'bold' });
  });

  it('renders nothing when there is neither current nor incoming data', () => {
    const { container } = renderCell({ formatter: () => 'x', itemData: null, incomingData: undefined });

    expect(container).toBeEmptyDOMElement();
  });

  it('shows a current row driven only by the extension data', () => {
    renderCell({
      formatter: (data, jsonExt) => jsonExt.label,
      itemData: undefined,
      jsonExt: { label: 'From extension' },
    });

    expect(screen.getByText('From extension')).toBeInTheDocument();
  });

  it('falls back to a hyphen when the formatter has nothing to show', () => {
    const { container } = renderCell({
      formatter: () => undefined,
      itemData: { name: 'x' },
      incomingData: { name: 'y' },
    });

    expect([...container.querySelectorAll('p')].map((p) => p.textContent)).toEqual(['-', '-']);
  });

  it('passes the formatter the data, the extension, its column and the setter', () => {
    const formatter = vi.fn(() => 'ok');
    const setAdditionalData = vi.fn();
    const jsonExt = { a: 1 };

    renderCell({
      formatter, itemData: { name: 'x' }, incomingData: { name: 'y' }, jsonExt, setAdditionalData,
    });

    expect(formatter).toHaveBeenCalledWith({ name: 'x' }, jsonExt, 2, setAdditionalData);
    expect(formatter).toHaveBeenCalledWith({ name: 'y' }, jsonExt, 2, setAdditionalData);
  });
});
