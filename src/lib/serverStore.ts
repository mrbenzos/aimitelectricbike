import fs from 'fs';
import path from 'path';
import { Bike, Order, TestRideBooking, ActivityLog } from './types';
import { INITIAL_BIKES, INITIAL_ORDERS, INITIAL_TEST_RIDES, INITIAL_ACTIVITY_LOGS } from './initialData';

const DATA_DIR = path.join(process.cwd(), 'data');
const BIKES_FILE = path.join(DATA_DIR, 'bikes.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const TEST_RIDES_FILE = path.join(DATA_DIR, 'test_rides.json');
const LOGS_FILE = path.join(DATA_DIR, 'activity_logs.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Data directory creation error:', e);
  }
}

// BIKES FILE STORE
export function readBikesFromFile(): Bike[] {
  ensureDataDir();
  try {
    if (fs.existsSync(BIKES_FILE)) {
      const content = fs.readFileSync(BIKES_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) return data as Bike[];
    }
  } catch (e) {
    console.warn('Read bikes from file warning:', e);
  }
  return INITIAL_BIKES;
}

export function writeBikesToFile(bikes: Bike[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(BIKES_FILE, JSON.stringify(bikes, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Write bikes to file warning:', e);
  }
}

// ORDERS FILE STORE
export function readOrdersFromFile(): Order[] {
  ensureDataDir();
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data as Order[];
    }
  } catch (e) {
    console.warn('Read orders from file warning:', e);
  }
  return [];
}

export function writeOrdersToFile(orders: Order[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Write orders to file warning:', e);
  }
}

// TEST RIDES FILE STORE
export function readTestRidesFromFile(): TestRideBooking[] {
  ensureDataDir();
  try {
    if (fs.existsSync(TEST_RIDES_FILE)) {
      const content = fs.readFileSync(TEST_RIDES_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data as TestRideBooking[];
    }
  } catch (e) {
    console.warn('Read test rides from file warning:', e);
  }
  return [];
}

export function writeTestRidesToFile(rides: TestRideBooking[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(TEST_RIDES_FILE, JSON.stringify(rides, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Write test rides to file warning:', e);
  }
}

// ACTIVITY LOGS FILE STORE
export function readLogsFromFile(): ActivityLog[] {
  ensureDataDir();
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const content = fs.readFileSync(LOGS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data as ActivityLog[];
    }
  } catch (e) {
    console.warn('Read logs from file warning:', e);
  }
  return [];
}

export function writeLogsToFile(logs: ActivityLog[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Write logs to file warning:', e);
  }
}
