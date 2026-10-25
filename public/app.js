const categories = [
  ['title', 'Title'],
  ['survey', 'Survey'],
  ['zoning', 'Zoning'],
  ['environmental', 'Environmental'],
  ['lease', 'Lease'],
  ['rent_roll', 'Rent roll'],
  ['operating_costs', 'Operating costs']
];

const industrialOrder = ['power', 'clearHeight', 'docks', 'floorLoad', 'transportAccess'];

const statusLabels = {
  verified: 'Verified',
  failed: 'Failed',
  outdated: 'Outdated',
  unable_to_verify: 'Unable to verify',
  superseded: 'Superseded',
  intact: 'Intact',
  excluded: 'Excluded',
  source_unavailable: 'Source unavailable',
  not_confirmed: 'Not confirmed',
  not_checked: 'Not checked',
  cited: 'Cited',
  not_found: 'Not found'
};

let state = null;
let verification = null;
let note = '';
let error = '';
let busy = false;

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    if (key === 'className') node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  return node;
}

function shortHash(value) {
  if (!value) return '—';
  const hex = String(value).replace(/^sha256:/, '');
  if (hex.length < 18) return value;
  return `sha256:${hex.slice(0, 8)}…${hex.slice(-6)}`;
}

function labelFor(status) {
  return statusLabels[status] || status || 'Not checked';
}

function docsById() {
  const map = new Map();
  for (const doc of verification?.documents || []) map.set(doc.documentId, doc);
  return map;
}

function renderDocuments() {
  const checked = docsById();
  const sections = categories.map(([key, label]) => {
    const docs = state.documents
      .filter((doc) => doc.category === key)
      .sort((a, b) => Number(a.version) - Number(b.version) || a.documentId.localeCompare(b.documentId));
    const rows = docs.map((doc) => {
      const result = checked.get(doc.documentId);
      const version = doc.current ? `v${doc.version} current` : `v${doc.version} superseded`;
      const rowStatus = result?.status || 'not_checked';
      const viability = result?.viability;
      const badges = [el('span', { className: `badge ${doc.current ? 'current' : 'superseded'}` }, [version])];
      if (viability) {
        badges.push(document.createTextNode(' '));
        badges.push(el('span', { className: `pill ${viability.status}`, title: viability.note }, [
          viability.status === 'stale' ? `Stale · ${viability.ageDays}d` : `Viable · ${viability.ageDays}d`
        ]));
      }
      return el('div', { className: 'doc', id: `doc-${doc.documentId}` }, [
        el('p', {}, badges),
        el('p', {}, [
          el('span', { className: 'doc-id' }, [doc.documentId]),
          document.createTextNode(` · review ${doc.reviewStatus}`),
          el('br'),
          el('span', { className: 'hash', title: result?.actualSha256 || doc.sha256 }, [shortHash(doc.sha256)])
        ]),
        el('p', {}, [el('span', { className: `pill ${rowStatus}` }, [labelFor(rowStatus)])])
      ]);
    });
    const viabilityNotes = key === 'environmental'
      ? docs.flatMap((doc) => {
        const viability = checked.get(doc.documentId)?.viability;
        return viability ? [`${doc.documentId} (${viability.reportDate}): ${viability.note}`] : [];
      })
      : [];
    const note = key === 'environmental'
      ? [el('p', { className: 'legend' }, [
        'Phase I v1 is superseded by v2. Only the current human-verified file is in the approved manifest. A Phase I report date more than 180 days before the as-of date is marked stale (ASTM E1527-21 §4.6). That flag does not change the hash result.',
        viabilityNotes.length
          ? ` ${viabilityNotes.map((item) => `${item.reportDate}: ${item.note}`).join(' ')}`
          : ''
      ])]
      : [];
    return el('section', { className: 'category', id: `category-${key}` }, [
      el('h3', {}, [label]),
      ...note,
      ...rows
    ]);
  });
  return el('section', { className: 'panel' }, [
    el('h2', {}, [`Record categories (${categories.length})`]),
    ...sections
  ]);
}

function anchorView() {
  return verification?.anchor || state.anchor || null;
}

function renderAnchor() {
  const anchor = anchorView();
  const pairs = anchor ? [
    ['Network', anchor.chainId ? `Hardhat local · chain ${anchor.chainId}` : 'Hardhat local', false],
    ['Contract', anchor.contractAddress || '—', true],
    ['Token id', anchor.tokenId || '—', true],
    ['Issuer', anchor.issuer || '—', true],
    ['Record version', anchor.recordVersion || '—', true],
    ['Manifest hash', anchor.manifestHash || '—', true],
    ['Manifest URI', anchor.manifestUri || '—', true],
    ['legal_title', String(anchor.legalTitle === true), false],
    ['investment_rights', String(anchor.investmentRights === true), false],
    ['Transfers', anchor.transferPolicy || 'disabled', false],
    ['Transaction', anchor.txHash || '—', true]
  ] : [];
  const body = anchor
    ? pairs.map(([label, value, mono]) => el('div', { className: 'pair' }, [
      el('dt', {}, [label]),
      el('dd', { className: mono ? '' : 'plain' }, [value])
    ]))
    : [el('p', {}, ['The chain anchor could not be read. This page will not call the record verified.'])];
  return el('section', { className: 'panel' }, [
    el('h2', {}, ['On-chain anchor']),
    el('p', { className: 'legend' }, ['The local chain stores the asset id, record version, and manifest hash. Source bytes stay on this machine.']),
    el('dl', {}, body)
  ]);
}

function renderFieldTable(rows) {
  const head = el('tr', {}, ['Field', 'Value', 'Status', 'Source', 'Location', 'Excerpt'].map((text) => el('th', { scope: 'col' }, [text])));
  const body = rows.map((row) => el('tr', { className: row.status === 'not_found' ? 'not_found' : '' }, [
    el('th', { scope: 'row' }, [row.label]),
    el('td', {}, [row.value == null ? '—' : row.value]),
    el('td', {}, [el('span', { className: `pill ${row.status}` }, [labelFor(row.status)])]),
    el('td', {}, [row.citation ? el('a', { href: `#doc-${row.citation.documentId}` }, [`${row.citation.documentId} v${row.citation.version}`]) : '—']),
    el('td', {}, [row.citation?.location || '—']),
    el('td', {}, [row.citation?.excerpt || row.note || '—'])
  ]));
  return el('div', { className: 'table-wrap' }, [
    el('table', {}, [el('thead', {}, [head]), el('tbody', {}, body)])
  ]);
}

function renderIndustrial() {
  const fields = industrialOrder
    .map((key) => state.asset.industrialFit[key])
    .filter(Boolean);
  return el('section', { className: 'panel' }, [
    el('h2', {}, ['Industrial fit']),
    el('p', { className: 'legend' }, ['Synthetic figures. A missing source is marked not_found and is not filled in.']),
    renderFieldTable(fields)
  ]);
}

function renderFacts() {
  return el('section', { className: 'panel' }, [
    el('h2', {}, ['Field citations']),
    renderFieldTable(state.asset.facts || [])
  ]);
}

function renderStatus() {
  const status = verification?.status || 'not_checked';
  const mismatches = (verification?.mismatches || []).map((item) => {
    const detail = item.actual ? ` · expected ${shortHash(item.expected)} · actual ${shortHash(item.actual)}` : '';
    return el('li', {}, [`${item.documentId} · ${item.reason}${detail}`]);
  });
  const lines = [
    el('p', { className: 'kicker' }, ['Verification']),
    el('p', { className: `status-word status-${status}` }, [labelFor(status)])
  ];
  if (verification?.manifestHash) lines.push(el('p', { className: 'hash' }, [`Current manifest ${verification.manifestHash}`]));
  if (verification?.anchoredManifestHash) lines.push(el('p', { className: 'hash' }, [`Anchored manifest ${verification.anchoredManifestHash}`]));
  if (note) lines.push(el('p', { className: 'note' }, [note]));
  if (verification?.reasons?.length) lines.push(el('p', { className: 'reasons' }, [verification.reasons.join(' · ')]));
  if (mismatches.length) lines.push(el('ul', { className: 'reasons' }, mismatches));
  return el('section', { className: 'status-row', 'aria-live': 'polite' }, [
    el('div', {}, lines)
  ]);
}

function render() {
  const app = document.querySelector('#app');
  app.replaceChildren();
  if (!state) {
    app.append(el('p', { className: error ? 'error' : 'loading' }, [error || 'Loading the asset record…']));
    return;
  }
  const asset = state.asset;
  app.append(
    el('div', { className: 'asset-head' }, [
      el('div', {}, [
        el('p', { className: 'kicker' }, [asset.dataStatus]),
        el('h1', {}, [asset.name]),
        el('p', { className: 'meta' }, [`${asset.assetId} · record ${asset.recordVersion}${asset.asOf ? ` · as of ${asset.asOf}` : ''} · ${asset.propertyType} · ${asset.locationLabel}`])
      ]),
      el('div', { className: 'actions' }, [
        button('Verify', '/api/verify', ''),
        button('Tamper ESA v2', '/api/tamper', 'danger'),
        button('Restore ESA v2', '/api/restore', 'ghost')
      ])
    ]),
    error ? el('p', { className: 'error' }, [error]) : el('span'),
    renderStatus(),
    el('div', { className: 'layout' }, [
      renderDocuments(),
      renderAnchor()
    ]),
    renderIndustrial(),
    renderFacts(),
    el('p', { className: 'legend' }, ['Statuses: Verified · Outdated · Failed · Unable to verify. Outdated means a newer approved manifest supersedes an intact anchor. Missing chain or source data stays Unable to verify.']),
    el('p', { className: 'footnote' }, ['Tamper changes only sample-data/documents/phase_i_esa_v2.txt and keeps a .clean-demo-backup until Restore or the CLI demo deletes it. Restarting this server also restores a leftover backup before it anchors.'])
  );
}

function button(text, url, className) {
  const node = el('button', { type: 'button', className, disabled: busy ? 'disabled' : null }, [text]);
  if (busy) node.disabled = true;
  node.addEventListener('click', () => runAction(url));
  return node;
}

async function runAction(url) {
  busy = true;
  error = '';
  render();
  try {
    const response = await fetch(url, { method: 'POST' });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || response.statusText);
    verification = body;
    note = body.note || '';
  } catch (err) {
    error = err.message || 'Verification failed';
  } finally {
    busy = false;
    render();
  }
}

async function load() {
  busy = true;
  render();
  try {
    const response = await fetch('/api/state');
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Could not load the asset');
    state = body;
  } catch (err) {
    error = err.message || 'Could not load the asset';
  } finally {
    busy = false;
    render();
  }
  if (state) await runAction('/api/verify');
}

load();
