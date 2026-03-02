const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3004;

const dbDir = path.join(__dirname, 'db');
fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'democracy_routes.db');

const db = new sqlite3.Database(dbPath);
const DEMOCRACYROUTES_BASE_URL = process.env.DEMOCRACYROUTES_BASE_URL || 'http://localhost:3015';
const DEMOCRACYROUTES_API_KEY = process.env.DEMOCRACYROUTES_API_KEY || '';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function parseModuleRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    inputs: row.inputs,
    outputs: row.outputs,
    type: row.type,
    fields: row.fields_json ? JSON.parse(row.fields_json) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function parseWorkflowRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    drawflow: row.drawflow_json ? JSON.parse(row.drawflow_json) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function seedBuiltInModules() {
  const builtIns = [
    {
      id: 'discussion',
      name: 'Discussion',
      icon: 'fa-comments',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'discussion-type',
          type: 'select',
          label: 'Discussion Type',
          slug: 'discussion-type',
          options: ['In Real Life', 'Round Discussion', 'Non Violent Communication']
        },
        {
          id: 'discussion-info',
          type: 'textarea',
          label: 'Info',
          slug: 'discussion-info',
          placeholder: 'Enter additional information'
        }
      ]
    },
    {
      id: 'decision',
      name: 'Decision',
      icon: 'fa-balance-scale',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'decision-method',
          type: 'select',
          label: 'Decision Method',
          slug: 'decision',
          options: ['By Majority', 'Consensus', 'At least x%', 'Authocracy', 'Delegating']
        },
        {
          id: 'decision-info',
          type: 'textarea',
          label: 'Info',
          slug: 'decision-info',
          placeholder: 'Enter additional information'
        }
      ]
    },
    {
      id: 'email',
      name: 'Email send',
      icon: 'fa-at',
      inputs: 1,
      outputs: 0,
      type: 'builtin',
      fields: [
        {
          id: 'email-address',
          type: 'text',
          label: 'Recipient',
          slug: 'email-recipient',
          placeholder: 'name@example.com'
        },
        {
          id: 'email-message',
          type: 'textarea',
          label: 'Message',
          slug: 'email-message',
          placeholder: 'Enter message'
        }
      ]
    },
    {
      id: 'participant',
      name: 'Participant',
      icon: 'fa-user',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'participant-attribute',
          type: 'select',
          label: 'Participant Attribute',
          slug: 'participant-attribute',
          options: ['Skill', 'Scientific Field', 'Experience', 'Sex/Gender', 'Proximity', 'Political Power', 'Sensitivity', 'Ideology']
        },
        {
          id: 'google-sheets-link',
          type: 'url',
          label: 'Google Sheets Link',
          slug: 'google-sheets-link',
          placeholder: 'https://docs.google.com/spreadsheets/d/...'
        },
        {
          id: 'participant-info',
          type: 'textarea',
          label: 'Info',
          slug: 'participant-info',
          placeholder: 'Enter additional information'
        }
      ]
    },
    {
      id: 'ai_agents',
      name: 'AI Agents',
      icon: 'fa-robot',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'agent-type',
          type: 'select',
          label: 'Agent Type',
          slug: 'agent-type',
          options: ['Academic Support', 'Bias Recognition', 'Historical Agent', 'Emotional Support', 'Mediator', 'Custom Agent']
        },
        {
          id: 'agent-info',
          type: 'textarea',
          label: 'Info',
          slug: 'agent-info',
          placeholder: 'Enter additional information'
        }
      ]
    },
    {
      id: 'gamification',
      name: 'Gamification',
      icon: 'fa-gamepad',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'gamification-name',
          type: 'text',
          label: 'Name',
          slug: 'name',
          placeholder: 'Enter name'
        },
        {
          id: 'gamification-info',
          type: 'textarea',
          label: 'Info',
          slug: 'gamification-info',
          placeholder: 'Enter additional information'
        }
      ]
    },
    {
      id: 'media',
      name: 'Media',
      icon: 'fa-video',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'media-file',
          type: 'file',
          label: 'Media File',
          slug: 'media-file',
          accept: 'audio/*,video/*'
        },
        {
          id: 'media-url',
          type: 'url',
          label: 'Media URL',
          slug: 'media-url',
          placeholder: 'https://example.com/media.mp4'
        },
        {
          id: 'media-info',
          type: 'textarea',
          label: 'Info',
          slug: 'media-info',
          placeholder: 'Enter additional information'
        }
      ]
    },
    {
      id: 'conflict_resolution',
      name: 'Conflict Resolution',
      icon: 'fa-handshake',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'conflict-method',
          type: 'select',
          label: 'Conflict Method',
          slug: 'conflict-method',
          options: ['Conversational Game Theory', 'Mediation', 'Negotiation', 'Arbitration']
        },
        {
          id: 'conflict-info',
          type: 'textarea',
          label: 'Info',
          slug: 'conflict-info',
          placeholder: 'Enter additional information'
        }
      ]
    },
    {
      id: 'citizen_assembly',
      name: 'Citizen Assembly',
      icon: 'fa-users',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'num-tables',
          type: 'number',
          label: 'Number of Tables',
          slug: 'num-tables',
          placeholder: 'Enter number of tables'
        },
        {
          id: 'streaming-mode',
          type: 'select',
          label: 'Streaming Mode',
          slug: 'streaming-mode',
          options: ['Live Streaming', 'Recorded & Transcribed']
        },
        {
          id: 'extra-security',
          type: 'checkbox',
          label: 'Extra Security',
          slug: 'extra-security',
          placeholder: 'Enable extra security measures'
        },
        {
          id: 'multilanguage',
          type: 'select',
          label: 'Multilanguage',
          slug: 'multilanguage',
          options: ['English (EN)', 'Spanish (ES)', 'French (FR)', 'German (DE)', 'Italian (IT)']
        }
      ]
    },
    {
      id: 'plan_settings',
      name: 'Plan Settings',
      icon: 'fa-sliders-h',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'plan-title',
          type: 'text',
          label: 'Title',
          slug: 'title',
          placeholder: 'Plan title',
          required: true
        },
        {
          id: 'plan-start-date',
          type: 'text',
          label: 'Start date',
          slug: 'start-date',
          placeholder: 'YYYY-MM-DD',
          required: true
        },
        {
          id: 'plan-start-time',
          type: 'text',
          label: 'Start time',
          slug: 'start-time',
          placeholder: 'HH:MM',
          required: true
        },
        {
          id: 'plan-timezone',
          type: 'text',
          label: 'Timezone',
          slug: 'timezone',
          placeholder: 'Europe/Rome'
        },
        {
          id: 'plan-round-duration',
          type: 'number',
          label: 'Default round duration (min)',
          slug: 'round-duration-minutes',
          placeholder: '60',
          defaultValue: '60'
        },
        {
          id: 'plan-rounds-count',
          type: 'number',
          label: 'Fallback rounds count',
          slug: 'rounds-count',
          placeholder: '1',
          defaultValue: '1'
        },
        {
          id: 'plan-sync-mode',
          type: 'select',
          label: 'Sync mode',
          slug: 'sync-mode',
          options: ['SERVER', 'CLIENT'],
          defaultValue: 'SERVER'
        },
        {
          id: 'plan-max-participants',
          type: 'number',
          label: 'Max participants per room',
          slug: 'max-participants-per-room',
          placeholder: '2',
          defaultValue: '2'
        },
        {
          id: 'plan-language',
          type: 'select',
          label: 'Language',
          slug: 'language',
          options: ['EN', 'IT'],
          defaultValue: 'EN'
        },
        {
          id: 'plan-transcription-provider',
          type: 'select',
          label: 'Transcription provider',
          slug: 'transcription-provider',
          options: ['DEEPGRAM', 'DEEPGRAMLIVE', 'VOSK'],
          defaultValue: 'DEEPGRAM'
        },
        {
          id: 'plan-dataspace',
          type: 'select',
          label: 'Dataspace',
          slug: 'dataspace-id',
          options: ['Loading...']
        }
      ]
    },
    {
      id: 'plan_participants',
      name: 'Plan Participants',
      icon: 'fa-users',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'plan-participants',
          type: 'textarea',
          label: 'Participants (emails)',
          slug: 'participants',
          placeholder: 'one per line',
          required: true
        },
        {
          id: 'plan-created-by',
          type: 'text',
          label: 'Created by (email)',
          slug: 'created-by-email',
          placeholder: 'admin@example.com'
        }
      ]
    },
    {
      id: 'plan_round',
      name: 'Round Block',
      icon: 'fa-sync-alt',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'plan-round-duration',
          type: 'number',
          label: 'Duration (min)',
          slug: 'duration-minutes',
          placeholder: '30',
          defaultValue: '30'
        }
      ]
    },
    {
      id: 'plan_pause',
      name: 'Pause Block',
      icon: 'fa-moon',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'plan-pause-duration',
          type: 'number',
          label: 'Duration (min)',
          slug: 'duration-minutes',
          placeholder: '5',
          defaultValue: '5'
        },
        {
          id: 'plan-pause-audio',
          type: 'select',
          label: 'Meditation audio',
          slug: 'meditation-audio-url',
          options: ['Loading...']
        }
      ]
    },
    {
      id: 'plan_prompt',
      name: 'Prompt Block',
      icon: 'fa-sticky-note',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'plan-prompt-title',
          type: 'text',
          label: 'Title',
          slug: 'poster-title',
          placeholder: 'Prompt title',
          required: true
        },
        {
          id: 'plan-prompt-content',
          type: 'textarea',
          label: 'Content',
          slug: 'poster-content',
          placeholder: 'Prompt content',
          required: true
        },
        {
          id: 'plan-prompt-duration',
          type: 'number',
          label: 'Duration (sec)',
          slug: 'duration-seconds',
          placeholder: '10',
          defaultValue: '10'
        }
      ]
    },
    {
      id: 'plan_notes',
      name: 'Notes Block',
      icon: 'fa-edit',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'plan-notes-duration',
          type: 'number',
          label: 'Duration (sec)',
          slug: 'duration-seconds',
          placeholder: '30',
          defaultValue: '30'
        }
      ]
    },
    {
      id: 'plan_publish',
      name: 'Publish Plan',
      icon: 'fa-paper-plane',
      inputs: 1,
      outputs: 0,
      type: 'builtin',
      fields: []
    },
    {
      id: 'new_plan',
      name: 'New Plan',
      icon: 'fa-calendar-check',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'plan-title',
          type: 'text',
          label: 'Title',
          slug: 'title',
          placeholder: 'Plan title',
          required: true
        },
        {
          id: 'plan-start-date',
          type: 'text',
          label: 'Start date',
          slug: 'start-date',
          placeholder: 'YYYY-MM-DD',
          required: true
        },
        {
          id: 'plan-start-time',
          type: 'text',
          label: 'Start time',
          slug: 'start-time',
          placeholder: 'HH:MM',
          required: true
        },
        {
          id: 'plan-round-duration',
          type: 'number',
          label: 'Round duration (min)',
          slug: 'round-duration-minutes',
          placeholder: '60',
          defaultValue: '60',
          required: true
        },
        {
          id: 'plan-rounds-count',
          type: 'number',
          label: 'Rounds count',
          slug: 'rounds-count',
          placeholder: '6',
          defaultValue: '6',
          required: true
        },
        {
          id: 'plan-sync-mode',
          type: 'select',
          label: 'Sync mode',
          slug: 'sync-mode',
          options: ['SERVER', 'CLIENT'],
          defaultValue: 'SERVER'
        },
        {
          id: 'plan-max-participants',
          type: 'number',
          label: 'Max participants per room',
          slug: 'max-participants-per-room',
          placeholder: '2',
          defaultValue: '2'
        },
        {
          id: 'plan-dataspace',
          type: 'select',
          label: 'Dataspace',
          slug: 'dataspace-id',
          options: ['Loading...']
        },
        {
          id: 'plan-participants',
          type: 'textarea',
          label: 'Participants (emails)',
          slug: 'participants',
          placeholder: 'one per line',
          required: true
        },
        {
          id: 'plan-created-by',
          type: 'text',
          label: 'Created by (email)',
          slug: 'created-by-email',
          placeholder: 'admin@example.com'
        }
      ]
    },
    {
      id: 'new_meeting',
      name: 'New Meeting',
      icon: 'fa-video',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'meeting-title',
          type: 'text',
          label: 'Title',
          slug: 'title',
          placeholder: 'Meeting title',
          required: true
        },
        {
          id: 'meeting-date',
          type: 'text',
          label: 'Date',
          slug: 'date',
          placeholder: 'YYYY-MM-DD'
        },
        {
          id: 'meeting-start-time',
          type: 'text',
          label: 'Start time',
          slug: 'start-time',
          placeholder: 'HH:MM'
        },
        {
          id: 'meeting-duration',
          type: 'number',
          label: 'Duration (min)',
          slug: 'duration-minutes',
          placeholder: '60',
          defaultValue: '60'
        },
        {
          id: 'meeting-language',
          type: 'select',
          label: 'Language',
          slug: 'language',
          options: ['EN', 'IT'],
          defaultValue: 'EN'
        },
        {
          id: 'meeting-transcription',
          type: 'select',
          label: 'Transcription provider',
          slug: 'transcription-provider',
          options: ['DEEPGRAM', 'VOSK'],
          defaultValue: 'DEEPGRAM'
        },
        {
          id: 'meeting-dataspace',
          type: 'select',
          label: 'Dataspace',
          slug: 'dataspace-id',
          options: ['Loading...']
        },
        {
          id: 'meeting-invites',
          type: 'textarea',
          label: 'Invite emails',
          slug: 'invite-emails',
          placeholder: 'one per line'
        },
        {
          id: 'meeting-created-by',
          type: 'text',
          label: 'Created by (email)',
          slug: 'created-by-email',
          placeholder: 'admin@example.com'
        }
      ]
    },
    {
      id: 'custom',
      name: 'Custom',
      icon: 'fa-cogs',
      inputs: 1,
      outputs: 1,
      type: 'builtin',
      fields: [
        {
          id: 'custom-name',
          type: 'text',
          label: 'Custom Name',
          slug: 'custom-name',
          placeholder: 'Custom Name'
        },
        {
          id: 'custom-info',
          type: 'textarea',
          label: 'Info',
          slug: 'custom-info',
          placeholder: 'Enter additional information'
        }
      ]
    }
  ];

  const stmt = db.prepare(
    `INSERT OR IGNORE INTO modules
      (id, name, icon, inputs, outputs, fields_json, type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  builtIns.forEach(module => {
    const now = new Date().toISOString();
    stmt.run(
      module.id,
      module.name,
      module.icon,
      module.inputs,
      module.outputs,
      JSON.stringify(module.fields || []),
      module.type,
      now,
      now
    );
  });

  stmt.finalize();
}

function initDb() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        inputs INTEGER NOT NULL,
        outputs INTEGER NOT NULL,
        fields_json TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        drawflow_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    );

    seedBuiltInModules();
  });
}

initDb();

app.get('/api/modules', async (req, res) => {
  try {
    const rows = await all(
      `SELECT * FROM modules
       ORDER BY CASE type WHEN 'builtin' THEN 0 ELSE 1 END, name ASC`
    );
    res.json(rows.map(parseModuleRow));
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to load modules');
  }
});

app.post('/api/modules', async (req, res) => {
  try {
    const payload = req.body || {};
    const now = new Date().toISOString();
    const id = payload.id || `custom_${Date.now()}`;
    const existing = await get('SELECT id FROM modules WHERE id = ?', [id]);
    if (existing) {
      res.status(409).send('Module with that ID already exists');
      return;
    }

    const module = {
      id,
      name: payload.name,
      icon: payload.icon || 'fa-cogs',
      inputs: Number.isInteger(payload.inputs) ? payload.inputs : 1,
      outputs: Number.isInteger(payload.outputs) ? payload.outputs : 1,
      fields: Array.isArray(payload.fields) ? payload.fields : [],
      type: payload.type || 'custom'
    };

    if (!module.name) {
      res.status(400).send('Module name is required');
      return;
    }

    await run(
      `INSERT INTO modules
        (id, name, icon, inputs, outputs, fields_json, type, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ,
      [
        module.id,
        module.name,
        module.icon,
        module.inputs,
        module.outputs,
        JSON.stringify(module.fields),
        module.type,
        now,
        now
      ]
    );

    res.json({ ...module, createdAt: now, updatedAt: now });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create module');
  }
});

app.put('/api/modules/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await get('SELECT * FROM modules WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).send('Module not found');
      return;
    }

    const payload = req.body || {};
    const now = new Date().toISOString();
    const fields = Array.isArray(payload.fields)
      ? payload.fields
      : (existing.fields_json ? JSON.parse(existing.fields_json) : []);

    const updated = {
      id,
      name: payload.name || existing.name,
      icon: payload.icon || existing.icon,
      inputs: payload.inputs !== undefined ? payload.inputs : existing.inputs,
      outputs: payload.outputs !== undefined ? payload.outputs : existing.outputs,
      fields,
      type: payload.type || existing.type
    };

    await run(
      `UPDATE modules
       SET name = ?, icon = ?, inputs = ?, outputs = ?, fields_json = ?, type = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.name,
        updated.icon,
        updated.inputs,
        updated.outputs,
        JSON.stringify(updated.fields),
        updated.type,
        now,
        id
      ]
    );

    res.json({ ...updated, createdAt: existing.created_at, updatedAt: now });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to update module');
  }
});

app.delete('/api/modules/:id', async (req, res) => {
  try {
    await run('DELETE FROM modules WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to delete module');
  }
});

app.post('/api/modules/import', async (req, res) => {
  try {
    const modules = Array.isArray(req.body.modules) ? req.body.modules : [];
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO modules
       (id, name, icon, inputs, outputs, fields_json, type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const now = new Date().toISOString();
    modules.forEach(module => {
      if (!module.id || !module.name) return;
      stmt.run(
        module.id,
        module.name,
        module.icon || 'fa-cogs',
        module.inputs || 1,
        module.outputs || 1,
        JSON.stringify(module.fields || []),
        module.type || 'custom',
        module.createdAt || now,
        module.updatedAt || now
      );
    });

    stmt.finalize();
    res.json({ imported: modules.length });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to import modules');
  }
});

async function fetchDemocracyRoutes(path, options = {}) {
  if (!DEMOCRACYROUTES_API_KEY) {
    return { ok: false, status: 500, payload: { error: 'DEMOCRACYROUTES_API_KEY is not set' } };
  }

  const response = await fetch(`${DEMOCRACYROUTES_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': DEMOCRACYROUTES_API_KEY,
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    payload = { error: text || 'Unexpected response' };
  }

  return { ok: response.ok, status: response.status, payload };
}

app.get('/api/integrations/democracyroutes/dataspaces', async (req, res) => {
  try {
    const result = await fetchDemocracyRoutes('/api/integrations/workflow/dataspaces');
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to load dataspaces');
  }
});

app.get('/api/integrations/democracyroutes/meditation/audio', async (req, res) => {
  try {
    const result = await fetchDemocracyRoutes('/api/integrations/workflow/meditation/audio');
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to load meditation audio');
  }
});

app.get('/api/integrations/democracyroutes/users', async (req, res) => {
  try {
    const dataspaceId = req.query.dataspace_id;
    if (!dataspaceId) {
      res.status(400).json({ error: 'dataspace_id is required' });
      return;
    }
    const result = await fetchDemocracyRoutes(`/api/integrations/workflow/users?dataspace_id=${encodeURIComponent(dataspaceId)}`);
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to load dataspace users');
  }
});

app.post('/api/integrations/democracyroutes/plans', async (req, res) => {
  try {
    const result = await fetchDemocracyRoutes('/api/integrations/workflow/plans', {
      method: 'POST',
      body: req.body || {}
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create plan');
  }
});

app.post('/api/integrations/democracyroutes/meetings', async (req, res) => {
  try {
    const result = await fetchDemocracyRoutes('/api/integrations/workflow/meetings', {
      method: 'POST',
      body: req.body || {}
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create meeting');
  }
});

app.get('/api/workflows', async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, title, updated_at FROM workflows ORDER BY updated_at DESC`
    );
    res.json(rows.map(row => ({
      id: row.id,
      title: row.title,
      updatedAt: row.updated_at
    })));
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to load workflows');
  }
});

app.get('/api/workflows/:id', async (req, res) => {
  try {
    const row = await get('SELECT * FROM workflows WHERE id = ?', [req.params.id]);
    if (!row) {
      res.status(404).send('Workflow not found');
      return;
    }
    res.json(parseWorkflowRow(row));
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to load workflow');
  }
});

app.post('/api/workflows', async (req, res) => {
  try {
    const payload = req.body || {};
    const now = new Date().toISOString();
    const id = payload.id || `wf_${Date.now()}`;
    const title = payload.title || `Workflow ${now.slice(0, 16).replace('T', ' ')}`;
    const drawflow = payload.drawflow ? JSON.stringify(payload.drawflow) : null;

    if (!drawflow) {
      res.status(400).send('drawflow is required');
      return;
    }

    await run(
      `INSERT INTO workflows
       (id, title, drawflow_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, title, drawflow, now, now]
    );

    res.json({ id, title, drawflow: JSON.parse(drawflow), createdAt: now, updatedAt: now });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create workflow');
  }
});

app.put('/api/workflows/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await get('SELECT * FROM workflows WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).send('Workflow not found');
      return;
    }

    const payload = req.body || {};
    const now = new Date().toISOString();
    const title = payload.title || existing.title;
    const drawflow = payload.drawflow
      ? JSON.stringify(payload.drawflow)
      : existing.drawflow_json;

    await run(
      `UPDATE workflows
       SET title = ?, drawflow_json = ?, updated_at = ?
       WHERE id = ?`,
      [title, drawflow, now, id]
    );

    res.json({
      id,
      title,
      drawflow: JSON.parse(drawflow),
      createdAt: existing.created_at,
      updatedAt: now
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to update workflow');
  }
});

app.delete('/api/workflows/:id', async (req, res) => {
  try {
    await run('DELETE FROM workflows WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to delete workflow');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
