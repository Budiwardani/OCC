import 'package:flutter/material.dart';
import 'submit_complaint_tab.dart';
import 'track_complaint_tab.dart';

class CustomerHomeScreen extends StatefulWidget {
  const CustomerHomeScreen({super.key});

  @override
  State<CustomerHomeScreen> createState() => _CustomerHomeScreenState();
}

class _CustomerHomeScreenState extends State<CustomerHomeScreen> {
  int _currentIndex = 0;
  final List<Widget> _tabs = [
    const SubmitComplaintTab(),
    const TrackComplaintTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("OCC Support"),
        actions: [
          IconButton(
            icon: const Icon(Icons.shield_outlined),
            tooltip: "Admin Login",
            onPressed: () => Navigator.pushNamed(context, '/login'),
          ),
        ],
      ),
      body: _tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (idx) => setState(() => _currentIndex = idx),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.add_circle_outline),
            label: "Submit",
          ),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: "Track"),
        ],
      ),
    );
  }
}
