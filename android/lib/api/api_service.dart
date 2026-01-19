import 'dart:io';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Use 10.0.2.2 for Android Emulator to access localhost
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  final Dio _dio = Dio(BaseOptions(baseUrl: baseUrl));

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // ==================== AUTH ====================

  Future<Response> login(String email, String password) async {
    return await _dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
  }

  // ==================== PUBLIC ====================

  Future<Response> getPublicStats() async {
    return await _dio.get('/public/stats');
  }

  Future<Response> getLatestComplaints() async {
    return await _dio.get('/public/latest');
  }

  Future<Response> getCategories() async {
    return await _dio.get('/categories');
  }

  Future<Response> submitComplaint(
    Map<String, dynamic> data,
    List<File> files,
  ) async {
    FormData formData = FormData.fromMap(data);

    for (var file in files) {
      String fileName = file.path.split('/').last;
      formData.files.add(
        MapEntry(
          "media",
          await MultipartFile.fromFile(file.path, filename: fileName),
        ),
      );
    }

    return await _dio.post(
      '/public/complaints',
      data: formData,
      options: Options(headers: {'Content-Type': 'multipart/form-data'}),
    );
  }

  Future<Response> trackComplaint(String ticket, String email) async {
    return await _dio.get(
      '/public/tracking',
      queryParameters: {'ticket': ticket, 'email': email},
    );
  }

  // ==================== SURAT KUASA ====================

  Future<Response> getSuratKuasa(String ticket) async {
    return await _dio.get('/surat-kuasa/$ticket');
  }

  Future<Response> lookupTicketByPhone(String phone) async {
    String? token = await _getToken();
    return await _dio.get('/surat-kuasa/lookup',
        queryParameters: {'phone': phone},
        options: Options(headers: {'Authorization': 'Bearer $token'}));
  }

  Future<Response> uploadSuratKuasa(String ticket, File file) async {
    String fileName = file.path.split('/').last;
    FormData formData = FormData.fromMap({
      'ticket_code': ticket,
      'file': await MultipartFile.fromFile(file.path, filename: fileName),
    });

    return await _dio.post('/surat-kuasa/upload', data: formData);
  }

  Future<Response> uploadSuratKuasaDraft(String ticketCode, File file) async {
    String? token = await _getToken();
    String fileName = file.path.split('/').last;
    FormData formData = FormData.fromMap({
      'ticket_code': ticketCode,
      'file': await MultipartFile.fromFile(file.path, filename: fileName),
    });

    return await _dio.post(
      '/surat-kuasa/draft',
      data: formData,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> getSignedSuratKuasa() async {
    String? token = await _getToken();
    return await _dio.get(
      '/surat-kuasa/signed',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  // ==================== DASHBOARD / COMPLAINTS ====================

  Future<Response> getDashboardStats() async {
    String? token = await _getToken();
    return await _dio.get(
      '/dashboard/stats',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> getComplaints({
    String? status,
    String? category,
    int? assignedAgent,
    String? search,
  }) async {
    String? token = await _getToken();
    Map<String, dynamic> params = {};
    if (status != null) params['status'] = status;
    if (category != null) params['category'] = category;
    if (assignedAgent != null) params['assigned_agent'] = assignedAgent;
    if (search != null) params['search'] = search;

    return await _dio.get(
      '/dashboard/complaints',
      queryParameters: params,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> getComplaint(int id) async {
    String? token = await _getToken();
    return await _dio.get(
      '/dashboard/complaints/$id',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> updateComplaint(int id, Map<String, dynamic> data) async {
    String? token = await _getToken();
    return await _dio.put(
      '/dashboard/complaints/$id',
      data: data,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> addComplaintResponse(
    int complaintId,
    String message,
    bool isInternal,
  ) async {
    String? token = await _getToken();
    return await _dio.post(
      '/dashboard/complaints/$complaintId/responses',
      data: {'message': message, 'is_internal': isInternal},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> notifyComplaint(int id) async {
    String? token = await _getToken();
    return await _dio.post(
      '/dashboard/complaints/$id/notify',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> forwardComplaint(int id, String email) async {
    String? token = await _getToken();
    return await _dio.post(
      '/dashboard/complaints/$id/forward',
      data: {'email': email},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> exportComplaints(String status) async {
    String? token = await _getToken();
    return await _dio.get(
      '/dashboard/complaints/export',
      queryParameters: {'status': status},
      options: Options(
        headers: {'Authorization': 'Bearer $token'},
        responseType: ResponseType.bytes,
      ),
    );
  }

  // ==================== CUSTOMER PORTAL ====================

  Future<Response> getMyComplaints() async {
    String? token = await _getToken();
    return await _dio.get(
      '/portal/complaints',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  // ==================== AGENTS ====================

  Future<Response> getAgents() async {
    String? token = await _getToken();
    return await _dio.get(
      '/dashboard/agents',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> createAgent(Map<String, dynamic> data) async {
    String? token = await _getToken();
    return await _dio.post(
      '/dashboard/agents',
      data: data,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  // ==================== CATEGORIES ====================

  Future<Response> createCategory(String id, String name) async {
    String? token = await _getToken();
    return await _dio.post(
      '/categories',
      data: {'id': id, 'name': name},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> deleteCategory(String id) async {
    String? token = await _getToken();
    return await _dio.delete(
      '/categories/$id',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  // ==================== COMPANIES ====================

  Future<Response> getCompanies() async {
    String? token = await _getToken();
    return await _dio.get(
      '/companies',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> createCompany(Map<String, dynamic> data) async {
    String? token = await _getToken();
    return await _dio.post(
      '/companies',
      data: data,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> updateCompany(int id, Map<String, dynamic> data) async {
    String? token = await _getToken();
    return await _dio.put(
      '/companies/$id',
      data: data,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> deleteCompany(int id) async {
    String? token = await _getToken();
    return await _dio.delete(
      '/companies/$id',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  // ==================== BRANDING ====================

  Future<Response> getBranding() async {
    String? token = await _getToken();
    return await _dio.get(
      '/branding',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> updateBranding(Map<String, dynamic> data) async {
    String? token = await _getToken();
    return await _dio.put(
      '/branding',
      data: data,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  // ==================== INVOICES ====================

  Future<Response> getInvoices() async {
    String? token = await _getToken();
    return await _dio.get(
      '/invoices',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> createInvoice(Map<String, dynamic> data) async {
    String? token = await _getToken();
    return await _dio.post(
      '/invoices',
      data: data,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  // ==================== OFFICIAL EMAILS ====================

  Future<Response> getOfficialEmails() async {
    String? token = await _getToken();
    return await _dio.get(
      '/official-emails',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> createOfficialEmail(String email) async {
    String? token = await _getToken();
    return await _dio.post(
      '/official-emails',
      data: {'email': email},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> deleteOfficialEmail(int id) async {
    String? token = await _getToken();
    return await _dio.delete(
      '/official-emails/$id',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  // ==================== MASTER TEMPLATES ====================

  Future<Response> getMasterFile(String key) async {
    return await _dio.get('/master-files/$key');
  }

  Future<Response> uploadMasterFile(String key, File file) async {
    String? token = await _getToken();
    String fileName = file.path.split('/').last;
    FormData formData = FormData.fromMap({
      'key': key,
      'file': await MultipartFile.fromFile(file.path, filename: fileName),
    });

    return await _dio.post(
      '/master-files',
      data: formData,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  // ==================== UPLOAD ====================

  Future<Response> uploadImage(File file) async {
    String? token = await _getToken();
    String fileName = file.path.split('/').last;
    FormData formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(file.path, filename: fileName),
    });

    return await _dio.post(
      '/upload',
      data: formData,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }
}
