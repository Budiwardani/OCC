import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DbHelper {
  static final DbHelper _instance = DbHelper._internal();
  static Database? _database;

  factory DbHelper() {
    return _instance;
  }

  DbHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDb();
    return _database!;
  }

  Future<Database> _initDb() async {
    String path = join(await getDatabasesPath(), 'occ_mobile.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_code TEXT,
            customer_name TEXT,
            customer_email TEXT,
            phone TEXT,
            location TEXT,
            city TEXT,
            category TEXT,
            subject TEXT,
            description TEXT,
            status TEXT,
            created_at TEXT,
            synced INTEGER DEFAULT 0
          )
        ''');
      },
    );
  }

  Future<int> insertComplaint(Map<String, dynamic> row) async {
    Database db = await database;
    return await db.insert('complaints', row);
  }

  Future<List<Map<String, dynamic>>> getComplaints() async {
    Database db = await database;
    return await db.query('complaints', orderBy: 'id DESC');
  }
}
