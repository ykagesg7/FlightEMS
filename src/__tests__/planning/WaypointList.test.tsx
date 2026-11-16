import WaypointList from '@/pages/planning/components/flight/WaypointList';
import type { FlightPlan, Waypoint } from '@/types/index';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testWaypoint: Waypoint = {
  id: 'wp-test',
  name: 'さいたま',
  type: 'custom',
  coordinates: [139.657, 35.861],
  latitude: 35.861,
  longitude: 139.657,
};

function makeFlightPlan(waypoints: Waypoint[] = [testWaypoint]): FlightPlan {
  return {
    waypoints,
    speed: 120,
    altitude: 8000,
    departureTime: '09:00',
    groundTempC: 20,
    groundElevationFt: 100,
    totalDistance: 50,
    ete: '0:30',
    eta: '09:30',
    tas: 120,
    mach: 0.2,
    routeSegments: [],
  };
}

function WaypointListHarness({ initialPlan }: { initialPlan: FlightPlan }) {
  const [flightPlan, setFlightPlan] = useState(initialPlan);
  return <WaypointList flightPlan={flightPlan} setFlightPlan={setFlightPlan} />;
}

describe('WaypointList waypoint name Enter key', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it('does not save on Enter during IME composition (isComposing)', async () => {

    const user = userEvent.setup();
    render(<WaypointListHarness initialPlan={makeFlightPlan()} />);

    await user.click(screen.getByRole('button', { name: 'さいたま' }));

    const input = screen.getByDisplayValue('さいたま');
    await user.clear(input);
    await user.type(input, '新名称');

    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 229,
      nativeEvent: new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
        isComposing: true,
      }),
    });

    expect(screen.getByDisplayValue('新名称')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '新名称' })).not.toBeInTheDocument();
  });

  it('does not save on Enter when keyCode is 229 (IME conversion)', async () => {
    const user = userEvent.setup();
    render(<WaypointListHarness initialPlan={makeFlightPlan()} />);

    await user.click(screen.getByRole('button', { name: 'さいたま' }));

    const input = screen.getByDisplayValue('さいたま');
    await user.clear(input);
    await user.type(input, '新名称');

    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 229,
    });

    expect(screen.getByDisplayValue('新名称')).toBeInTheDocument();
  });

  it('saves on plain Enter when not composing', async () => {
    const user = userEvent.setup();
    render(<WaypointListHarness initialPlan={makeFlightPlan()} />);

    await user.click(screen.getByRole('button', { name: 'さいたま' }));

    const input = screen.getByDisplayValue('さいたま');
    await user.clear(input);
    await user.type(input, 'RJTY');

    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      nativeEvent: new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
        isComposing: false,
      }),
    });

    expect(screen.queryByDisplayValue('RJTY')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RJTY' })).toBeInTheDocument();
  });
});