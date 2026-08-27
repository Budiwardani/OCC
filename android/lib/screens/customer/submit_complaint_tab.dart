import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../api/api_service.dart';
import '../../database/db_helper.dart';

class SubmitComplaintTab extends StatefulWidget {
  const SubmitComplaintTab({super.key});

  @override
  State<SubmitComplaintTab> createState() => _SubmitComplaintTabState();
}

class _SubmitComplaintTabState extends State<SubmitComplaintTab> {
  final _formKey = GlobalKey<FormState>();
  final _api = ApiService();
  final _dbHelper = DbHelper();

  // Controllers
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _subjectCtrl = TextEditingController();
  final _descCtrl = TextEditingController();

  // State
  List<dynamic> _categories = [];
  String? _selectedCategory;
  List<File> _mediaFiles = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  _loadCategories() async {
    try {
      final res = await _api.getCategories();
      if (res.statusCode == 200) {
        setState(() => _categories = res.data);
      }
    } catch (e) {
      print("Error loading categories: $e");
    }
  }

  _pickMedia() async {
    final picker = ImagePicker();
    final List<XFile> images = await picker.pickMultiImage();
    if (images.isNotEmpty) {
      setState(() {
        _mediaFiles.addAll(images.map((x) => File(x.path)));
      });
    }
  }

  _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategory == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Select a category")));
      return;
    }

    setState(() => _loading = true);
    try {
      final data = {
        'customer_name': _nameCtrl.text,
        'customer_email': _emailCtrl.text,
        'phone': _phoneCtrl.text,
        'location': _locationCtrl.text,
        'city': _cityCtrl.text,
        'subject': _subjectCtrl.text,
        'description': _descCtrl.text,
        'category': _selectedCategory,
      };

      // API Submit
      final res = await _api.submitComplaint(data, _mediaFiles);

      // Local Save
      if (res.statusCode == 200) {
        final ticket = res.data['ticket_code'];
        await _dbHelper.insertComplaint({
          'ticket_code': ticket,
          'customer_name': _nameCtrl.text,
          'customer_email': _emailCtrl.text,
          'phone': _phoneCtrl.text,
          'location': _locationCtrl.text,
          'city': _cityCtrl.text,
          'category': _selectedCategory,
          'subject': _subjectCtrl.text,
          'description': _descCtrl.text,
          'status': 'OPEN',
          'created_at': DateTime.now().toIso8601String(),
          'synced': 1
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Success! Ticket: $ticket")),
          );
          _resetForm();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("Submission Failed")));
      }
      print(e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  _resetForm() {
    _nameCtrl.clear();
    _emailCtrl.clear();
    _phoneCtrl.clear();
    _locationCtrl.clear();
    _cityCtrl.clear();
    _subjectCtrl.clear();
    _descCtrl.clear();
    setState(() {
      _selectedCategory = null;
      _mediaFiles = [];
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            DropdownButtonFormField(
              decoration: const InputDecoration(labelText: "Category"),
              value: _selectedCategory,
              items: _categories.map<DropdownMenuItem<String>>((c) {
                return DropdownMenuItem(
                  value: c['id'].toString(),
                  child: Text(c['name']),
                );
              }).toList(),
              onChanged: (v) => setState(() => _selectedCategory = v),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: "Full Name"),
              validator: (v) => v!.isEmpty ? "Required" : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _emailCtrl,
              decoration: const InputDecoration(labelText: "Email"),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _phoneCtrl,
              decoration: const InputDecoration(labelText: "WhatsApp / Phone"),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _locationCtrl,
              decoration: const InputDecoration(labelText: "Location Address"),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _cityCtrl,
              decoration: const InputDecoration(labelText: "City"),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _subjectCtrl,
              decoration: const InputDecoration(labelText: "Subject"),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _descCtrl,
              decoration: const InputDecoration(labelText: "Description"),
              maxLines: 4,
            ),
            const SizedBox(height: 16),

            // Media
            Align(
              alignment: Alignment.centerLeft,
              child: Text("Evidence (${_mediaFiles.length} files)"),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: _mediaFiles
                  .map(
                    (f) => Chip(
                      label: Text(
                        f.path.split('/').last.substring(0, 5) + "...",
                      ),
                      onDeleted: () => setState(() => _mediaFiles.remove(f)),
                    ),
                  )
                  .toList(),
            ),
            ElevatedButton.icon(
              onPressed: _pickMedia,
              icon: const Icon(Icons.attach_file),
              label: const Text("Attach Images"),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                ),
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Submit Complaint"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
