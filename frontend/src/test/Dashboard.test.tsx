import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Dashboard from '../components/Dashboard';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_MATCH = {
  match_info: {
    team_a: 'Royal Challengers Bengaluru',
    team_b: 'Gujarat Titans',
    status: 'IPL 2026 Final - Live',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    toss: 'RCB won the toss',
  },
  live_score: {
    team_a_total: 185,
    team_a_wickets: 10,
    team_a_overs: 20.0,
    team_b_total: 102,
    team_b_wickets: 3,
    team_b_overs: 12.4,
    current_run_rate: 8.05,
    required_run_rate: 11.5,
    target: 186,
  },
  partnership: {
    runs: 45,
    balls: 28,
    player1: { name: 'Virat Kohli', runs: 58, balls: 35 },
    player2: { name: 'Glenn Phillips', runs: 18, balls: 12 },
  },
};

const MOCK_MOMENTUM = {
  momentum: [
    { over: 1, momentum: 50, win_prob_a: 50, win_prob_b: 50 },
    { over: 5, momentum: 60, win_prob_a: 55, win_prob_b: 45 },
  ],
};

// ── Fetch mock ─────────────────────────────────────────────────────────────────

const fetchMock = vi.fn();
beforeEach(() => {
  global.fetch = fetchMock;
  fetchMock.mockImplementation((url: string) => {
    if (url === '/api/match') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_MATCH) });
    }
    if (url === '/api/momentum') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_MOMENTUM) });
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });
});
afterEach(() => vi.restoreAllMocks());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Dashboard', () => {
  it('shows a loading spinner initially', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders team names after data loads', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText('Royal Challengers Bengaluru')).toBeInTheDocument()
    );
    expect(screen.getByText('Gujarat Titans')).toBeInTheDocument();
  });

  it('displays the correct live score', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/185/)).toBeInTheDocument());
  });

  it('has a heading with team names', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: /Royal Challengers Bengaluru vs Gujarat Titans/ })
      ).toBeInTheDocument()
    );
  });

  it('renders section landmarks for accessibility', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => screen.getByText('Royal Challengers Bengaluru'));
    const sections = document.querySelectorAll('section[aria-label]');
    expect(sections.length).toBeGreaterThanOrEqual(3);
  });

  it('shows an error message when the API fails', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
    );
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
  });

  it('renders partnership stats', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Virat Kohli')).toBeInTheDocument());
    expect(screen.getByText('Glenn Phillips')).toBeInTheDocument();
  });
});
