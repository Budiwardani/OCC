import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../api/api_service.dart';

class TrackComplaintTab extends StatefulWidget {
  const TrackComplaintTab({super.key});

  @override
  State<TrackComplaintTab> createState() => _TrackComplaintTabState();
}

class _TrackComplaintTabState extends State<TrackComplaintTab> {
  final _ticketCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();

  Map<String, dynamic>? _data;
  List<dynamic> _suratKuasaFiles = [];
  bool _loading = false;
  final _api = ApiService();

  _track() async {
    setState(() => _loading = true);
    try {
      final res = await _api.trackComplaint(_ticketCtrl.text, _emailCtrl.text);
      if (res.statusCode == 200) {
        setState(() => _data = res.data);
        _loadSuratKuasa();
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(
            const SnackBar(content: Text("Not Found or Email Mismatch")));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  _loadSuratKuasa() async {
    try {
      final res = await _api.getSuratKuasa(_ticketCtrl.text);
      if (res.statusCode == 200) {
        setState(() => _suratKuasaFiles = res.data);
      }
    } catch (_) {}
  }

  _uploadSuratKuasa() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles();
    if (result != null) {
      File file = File(result.files.single.path!);
      try {
        await _api.uploadSuratKuasa(_ticketCtrl.text, file);
        _loadSuratKuasa();
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("Uploaded Successfully")));
      } catch (e) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("Upload Failed")));
      }
    }
  }

  _download(String path) async {
    // path is relative like 'uploads/...'
    final url = Uri.parse('${ApiService.baseUrl.replaceAll("/api", "")}/$path');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            controller: _ticketCtrl,
            decoration: const InputDecoration(labelText: "Ticket Code"),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _emailCtrl,
            decoration: const InputDecoration(
              labelText: "Email (for verification)",
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loading ? null : _track,
            child: const Text("Track Status"),
          ),
          if (_data != null) ...[
            const Divider(height: 32),
            Text(
              _data!['subject'] ?? '',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              "Status: ${_data!['status']}",
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
            const SizedBox(height: 8),
            Text(_data!['description'] ?? ''),
            const Divider(height: 32),

            // Surat Kuasa
            const Text(
              "Surat Kuasa (Power of Attorney)",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            ..._suratKuasaFiles.map(
              (f) => ListTile(
                title: Text(
                  f['uploaded_by'] == 'ADMIN'
                      ? 'Draft (Admin)'
                      : 'Signed (Customer)',
                ),
                trailing: IconButton(
                  icon: const Icon(Icons.download),
                  onPressed: () => _download(f['file_path']),
                ),
              ),
            ),
            TextButton.icon(
              onPressed: _uploadSuratKuasa,
              icon: const Icon(Icons.upload_file),
              label: const Text("Upload Signed Copy"),
            ),
          ],
        ],
      ),
    );
  }
}
