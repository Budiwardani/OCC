import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  bool _isAuthenticated = false;
  String? _userRole;
  bool _isLoading = false;

  bool get isAuthenticated => _isAuthenticated;
  String? get userRole => _userRole;
  bool get isLoading => _isLoading;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.login(email, password);
      if (response.statusCode == 200) {
        final token = response.data['token'];
        final role = response.data['user']['role'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('role', role);

        _isAuthenticated = true;
        _userRole = role;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print("Login Error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    _isAuthenticated = false;
    _userRole = null;
    notifyListeners();
  }

  Future<void> checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null) {
      _isAuthenticated = true;
      _userRole = prefs.getString('role');
    }
    notifyListeners();
  }
}
