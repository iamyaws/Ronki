// One-time Brevo setup for the template double opt-in (drafted 25 Sep 2026).
//
// Creates, if missing: the contact folder "Ronki", the list "Ronki Updates"
// and the German double opt-in template "Ronki Double-Opt-in". Prints their
// ids and the two SQL lines that store them in Supabase Vault. The API key is
// read from .env.local (BREVO_API_KEY) and never printed.
//
// Before running: Brevo account exists, ronki.de is authenticated in Brevo
// (DKIM records at GoDaddy; DMARC on ronki.de is p=quarantine), and
// hallo@ronki.de is a verified sender.
//
// Run from the repo root: node scripts/brevo-setup.mjs

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]),
);
const KEY = env.BREVO_API_KEY;
if (!KEY) {
  console.error('BREVO_API_KEY is missing in .env.local');
  process.exit(1);
}

const API = 'https://api.brevo.com/v3';
async function brevo(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'api-key': KEY, accept: 'application/json', 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path}: HTTP ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

const FOLDER = 'Ronki';
const LIST = 'Ronki Updates';
const TEMPLATE = 'Ronki Double-Opt-in';

// Plain, readable, no tracking pixels of our own. {{ doubleoptin }} is Brevo's
// confirmation link; the template must carry it (and the "optin" tag).
const HTML = `<!doctype html><html lang="de"><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#040812">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p style="font-size:22px;font-weight:bold;margin:0 0 16px">Bitte bestätige: Neues von Ronki</p>
<p style="font-size:16px;line-height:1.5">Hallo, du hast auf ronki.de eine Vorlage geholt und angekreuzt, dass wir dir ab und zu schreiben dürfen: neue Vorlagen und was wir gerade an Ronki bauen, höchstens einmal im Monat.</p>
<p style="font-size:16px;line-height:1.5">Bitte bestätige das mit einem Klick:</p>
<p style="margin:24px 0"><a href="{{ doubleoptin }}" style="background:#0544B0;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px;display:inline-block">Ja, ich möchte Neues von Ronki</a></p>
<p style="font-size:14px;line-height:1.5;color:#40444d">Wenn du das nicht warst, ignorier diese Mail einfach. Dann schreiben wir dir nie.</p>
<p style="font-size:13px;line-height:1.5;color:#40444d;margin-top:32px">Ronki · hallo@ronki.de · <a href="https://www.ronki.de/impressum" style="color:#0544B0">Impressum</a> · <a href="https://www.ronki.de/datenschutz#vorlagen" style="color:#0544B0">Datenschutz</a></p>
</div></body></html>`;

const folders = (await brevo('GET', '/contacts/folders?limit=50&offset=0')).folders ?? [];
const folderId = folders.find((f) => f.name === FOLDER)?.id ?? (await brevo('POST', '/contacts/folders', { name: FOLDER })).id;

const lists = (await brevo('GET', '/contacts/lists?limit=50&offset=0')).lists ?? [];
const listId = lists.find((l) => l.name === LIST)?.id ?? (await brevo('POST', '/contacts/lists', { name: LIST, folderId })).id;

const templates = (await brevo('GET', '/smtp/templates?limit=50&offset=0')).templates ?? [];
const templateId =
  templates.find((t) => t.name === TEMPLATE)?.id ??
  (await brevo('POST', '/smtp/templates', {
    tag: 'optin',
    sender: { name: 'Ronki', email: 'hallo@ronki.de' },
    templateName: TEMPLATE,
    subject: 'Bitte bestätige: Neues von Ronki',
    htmlContent: HTML,
    isActive: true,
  })).id;

console.log(`folder ${folderId}, list ${listId}, template ${templateId}`);
console.log('Store the two ids in Supabase Vault (not secret):');
console.log(`  select vault.create_secret('${listId}', 'brevo_list_id');`);
console.log(`  select vault.create_secret('${templateId}', 'brevo_doi_template_id');`);
console.log("The API key goes in by Marc in the SQL editor: select vault.create_secret('<key>', 'brevo_api_key');");
