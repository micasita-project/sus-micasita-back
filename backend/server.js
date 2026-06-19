require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || '*').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    // !origin = no Origin header (curl, Postman, server-to-server)
    // origin === 'null' = file:// protocol (browser sends literal string "null")
    if (allowedOrigins.includes('*') || !origin || origin === 'null' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origin not allowed — ' + origin));
    }
  }
}));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS sus_sessions (
  id BIGSERIAL PRIMARY KEY,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  edad INTEGER,
  genero TEXT,
  dist_vive TEXT,
  dist_trabajo TEXT,
  transporte TEXT,
  presupuesto INTEGER,
  freq_apps TEXT,
  exp_app TEXT,
  t1_comp INTEGER,
  t1_tiempo NUMERIC,
  t1_obs TEXT,
  t2_comp INTEGER,
  t2_tiempo NUMERIC,
  t2_obs TEXT,
  t3_comp INTEGER,
  t3_tiempo NUMERIC,
  t3_obs TEXT,
  top1 TEXT,
  sus_q1 INTEGER, sus_q2 INTEGER, sus_q3 INTEGER, sus_q4 INTEGER,
  sus_q5 INTEGER, sus_q6 INTEGER, sus_q7 INTEGER, sus_q8 INTEGER,
  sus_q9 INTEGER, sus_q10 INTEGER,
  sus_score NUMERIC,
  nivel TEXT,
  oa1 TEXT, oa2 TEXT, oa3 TEXT, oa4 TEXT,
  p5_usa TEXT, oa5 TEXT
);`;

async function initDB() {
  try {
    await pool.query(CREATE_TABLE_SQL);
    console.log('Tabla sus_sessions lista.');
  } catch (err) {
    console.error('Error creando tabla:', err.message);
  }
}

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// GET /api/sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sus_sessions ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sessions
app.post('/api/sessions', async (req, res) => {
  try {
    const b = req.body;

    const q1 = parseInt(b.sus_q1) || 0;
    const q2 = parseInt(b.sus_q2) || 0;
    const q3 = parseInt(b.sus_q3) || 0;
    const q4 = parseInt(b.sus_q4) || 0;
    const q5 = parseInt(b.sus_q5) || 0;
    const q6 = parseInt(b.sus_q6) || 0;
    const q7 = parseInt(b.sus_q7) || 0;
    const q8 = parseInt(b.sus_q8) || 0;
    const q9 = parseInt(b.sus_q9) || 0;
    const q10 = parseInt(b.sus_q10) || 0;

    const sum =
      (q1 - 1) + (5 - q2) +
      (q3 - 1) + (5 - q4) +
      (q5 - 1) + (5 - q6) +
      (q7 - 1) + (5 - q8) +
      (q9 - 1) + (5 - q10);
    const sus_score = sum * 2.5;

    let nivel;
    if (sus_score >= 85) nivel = 'Excelente';
    else if (sus_score >= 70) nivel = 'Bueno';
    else if (sus_score >= 50) nivel = 'Regular';
    else nivel = 'Inaceptable';

    const sql = `
      INSERT INTO sus_sessions (
        nombre, edad, genero, dist_vive, dist_trabajo, transporte,
        presupuesto, freq_apps, exp_app,
        t1_comp, t1_tiempo, t1_obs,
        t2_comp, t2_tiempo, t2_obs,
        t3_comp, t3_tiempo, t3_obs,
        top1,
        sus_q1, sus_q2, sus_q3, sus_q4, sus_q5,
        sus_q6, sus_q7, sus_q8, sus_q9, sus_q10,
        sus_score, nivel,
        oa1, oa2, oa3, oa4, p5_usa, oa5
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
        $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,
        $30,$31,$32,$33,$34,$35,$36,$37
      ) RETURNING *`;

    const values = [
      b.nombre, b.edad || null, b.genero || null,
      b.dist_vive || null, b.dist_trabajo || null, b.transporte || null,
      b.presupuesto || null, b.freq_apps || null, b.exp_app || null,
      b.t1_comp != null ? b.t1_comp : null, b.t1_tiempo || null, b.t1_obs || null,
      b.t2_comp != null ? b.t2_comp : null, b.t2_tiempo || null, b.t2_obs || null,
      b.t3_comp != null ? b.t3_comp : null, b.t3_tiempo || null, b.t3_obs || null,
      b.top1 || null,
      q1, q2, q3, q4, q5, q6, q7, q8, q9, q10,
      sus_score, nivel,
      b.oa1 || null, b.oa2 || null, b.oa3 || null, b.oa4 || null,
      b.p5_usa || null, b.oa5 || null
    ];

    const result = await pool.query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sessions/:id
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sus_sessions WHERE id = $1', [id]);
    res.json({ success: true, deleted_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const mainQ = await pool.query(`
      SELECT
        COUNT(*) AS total,
        ROUND(AVG(sus_score)::numeric, 1) AS sus_avg,
        MIN(sus_score) AS sus_min,
        MAX(sus_score) AS sus_max,
        ROUND(STDDEV(sus_score)::numeric, 1) AS sus_std,
        ROUND(100.0 * SUM(CASE WHEN t1_comp=1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 1) AS t1_rate,
        ROUND(100.0 * SUM(CASE WHEN t2_comp=1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 1) AS t2_rate,
        ROUND(100.0 * SUM(CASE WHEN t3_comp=1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 1) AS t3_rate,
        ROUND(100.0 * SUM(CASE WHEN top1='Sí' THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 1) AS top1_si,
        ROUND(100.0 * SUM(CASE WHEN top1='No' THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 1) AS top1_no,
        ROUND(100.0 * SUM(CASE WHEN top1='Tal vez' THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 1) AS top1_talvez,
        ROUND(100.0 * SUM(CASE WHEN sus_score>=70 THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 1) AS pct_gte_70
      FROM sus_sessions
    `);

    const qAvg = await pool.query(`
      SELECT
        ROUND(AVG(sus_q1)::numeric,1) AS q1,
        ROUND(AVG(sus_q2)::numeric,1) AS q2,
        ROUND(AVG(sus_q3)::numeric,1) AS q3,
        ROUND(AVG(sus_q4)::numeric,1) AS q4,
        ROUND(AVG(sus_q5)::numeric,1) AS q5,
        ROUND(AVG(sus_q6)::numeric,1) AS q6,
        ROUND(AVG(sus_q7)::numeric,1) AS q7,
        ROUND(AVG(sus_q8)::numeric,1) AS q8,
        ROUND(AVG(sus_q9)::numeric,1) AS q9,
        ROUND(AVG(sus_q10)::numeric,1) AS q10
      FROM sus_sessions
    `);

    const byTransport = await pool.query(`
      SELECT transporte,
        ROUND(AVG(sus_score)::numeric,1) AS avg_score,
        COUNT(*) AS n
      FROM sus_sessions
      WHERE transporte IS NOT NULL
      GROUP BY transporte
    `);

    const stats = mainQ.rows[0];
    res.json({
      ...stats,
      q_avgs: qAvg.rows[0],
      by_transport: byTransport.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/export/csv
app.get('/api/sessions/export/csv', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sus_sessions ORDER BY fecha ASC');
    const rows = result.rows;

    const headers = [
      'ID','Fecha','Nombre','Edad','Genero','Dist_Vive','Dist_Trabajo',
      'Transporte','Presupuesto','Freq_Apps','Exp_App',
      'T1_Comp','T1_Tiempo','T2_Comp','T2_Tiempo','T3_Comp','T3_Tiempo',
      'Top1','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10',
      'SUS_Score','Nivel','T1_Obs','T2_Obs','T3_Obs',
      'P1','P2','P3','P4','P5_Usa','P5_Coment'
    ];

    const escape = (v) => {
      if (v == null) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push([
        r.id, r.fecha, r.nombre, r.edad, r.genero,
        r.dist_vive, r.dist_trabajo, r.transporte, r.presupuesto,
        r.freq_apps, r.exp_app,
        r.t1_comp, r.t1_tiempo,
        r.t2_comp, r.t2_tiempo,
        r.t3_comp, r.t3_tiempo,
        r.top1,
        r.sus_q1, r.sus_q2, r.sus_q3, r.sus_q4, r.sus_q5,
        r.sus_q6, r.sus_q7, r.sus_q8, r.sus_q9, r.sus_q10,
        r.sus_score, r.nivel,
        r.t1_obs, r.t2_obs, r.t3_obs,
        r.oa1, r.oa2, r.oa3, r.oa4, r.p5_usa, r.oa5
      ].map(escape).join(','));
    }

    const csv = lines.join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=SUS_MiCasita.csv');
    res.send('﻿' + csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(port, () => {
    console.log('Backend MiCasita SUS corriendo en puerto', port);
  });
});
