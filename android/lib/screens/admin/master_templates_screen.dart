import 'package:flutter/material.dart';
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import '../../api/api_service.dart';
import '../../widgets/loading_indicator.dart';
import 'package:url_launcher/url_launcher.dart';

class MasterTemplatesScreen extends StatefulWidget {
  const MasterTemplatesScreen({super.key});

  @override
  State<MasterTemplatesScreen> createState() => _MasterTemplatesScreenState();
}

class _MasterTemplatesScreenState extends State<MasterTemplatesScreen> {
  final _api = ApiService();
  Map<String, dynamic>? _masterFile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadMasterFile();
  }

  Future<void> _loadMasterFile() async {
    setState(() => _loading = true);
    try {
      final response = await _api.getMasterFile('surat_kuasa');
      if (response.statusCode == 200) {
        setState(() => _masterFile = response.data);
      }
    } catch (_) {
      // File might not exist yet
    }
    setState(() => _loading = false);
  }

  Future<void> _uploadTemplate() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'docx', 'doc'],
    );

    if (result != null) {
      File file = File(result.files.single.path!);

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          content: Row(
            children: [
              CircularProgressIndicator(),
              SizedBox(width: 16),
              Text('Uploading...'),
            ],
          ),
        ),
      );

      try {
        await _api.uploadMasterFile('surat_kuasa', file);
        if (mounted) {
          Navigator.pop(context); // Close loading dialog
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Template uploaded successfully')),
          );
          _loadMasterFile();
        }
      } catch (e) {
        if (mounted) {
          Navigator.pop(context); // Close loading dialog
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Upload failed: ${e.toString()}')),
          );
        }
      }
    }
  }

  Future<void> _downloadTemplate() async {
    if (_masterFile == null) return;

    final path = _masterFile!['file_path'];
    final url = Uri.parse('${ApiService.baseUrl.replaceAll("/api", "")}/$path');

    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to download: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Master Templates'),
      ),
      body: _loading
          ? const LoadingIndicator(message: 'Loading templates...')
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Surat Kuasa Master Template',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'This template will be automatically available for all customers to download.',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  if (_masterFile != null) ...[
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.file_present, size: 40),
                        title: const Text('Current Template'),
                        subtitle: Text(
                          'Uploaded: ${_masterFile!['created_at'].toString().split('T')[0]}',
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.download),
                              onPressed: _downloadTemplate,
                              tooltip: 'Download',
                            ),
                            IconButton(
                              icon:
                                  const Icon(Icons.upload, color: Colors.blue),
                              onPressed: _uploadTemplate,
                              tooltip: 'Replace',
                            ),
                          ],
                        ),
                      ),
                    ),
                  ] else ...[
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(Icons.cloud_off,
                                  size: 64, color: Colors.grey),
                              SizedBox(height: 16),
                              Text(
                                'No master template uploaded yet',
                                style: TextStyle(color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _uploadTemplate,
                        icon: const Icon(Icons.upload_file),
                        label: const Text('Upload Template'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.all(16),
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  const Divider(),
                  const SizedBox(height: 16),
                  const Text(
                    'Instructions:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '1. Upload a PDF or DOCX file as the master template\n'
                    '2. This template will be available for download on:\n'
                    '   • Customer tracking page\n'
                    '   • Customer portal\n'
                    '   • Email and WhatsApp notifications\n'
                    '3. Customers can sign and re-upload the document',
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
    );
  }
}
