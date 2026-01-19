import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  _checkAuth() async {
    await Provider.of<AuthProvider>(context, listen: false).checkAuth();
    // Simulate splash delay
    await Future.delayed(const Duration(seconds: 2));

    // Check if mounted
    if (!mounted) return;

    // Decide where to go. For now, we present a choice: Admin or Customer?
    // Actually, usually app starts at a "landing" or "customer home".
    // Admin login is accessible from there or via a specific route.
    // Let's go to Customer Home by default.
    Navigator.pushReplacementNamed(context, '/customer');
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo placeholder
            Icon(Icons.support_agent, size: 80, color: Color(0xFF2563EB)),
            SizedBox(height: 20),
            Text(
              "OCC Mobile",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
