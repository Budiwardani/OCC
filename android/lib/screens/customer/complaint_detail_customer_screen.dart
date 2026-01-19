import 'package:flutter/material.dart';
import '../../models/complaint.dart';
import '../../models/response.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/response_bubble.dart';
import '../../widgets/loading_indicator.dart';
import '../../api/api_service.dart';
import 'package:url_launcher/url_launcher.dart';

class ComplaintDetailCustomerScreen extends StatefulWidget {
  final Complaint complaint;

  const ComplaintDetailCustomerScreen({super.key, required this.complaint});

  @override
  State<ComplaintDetailCustomerScreen> createState() =>
      _ComplaintDetailCustomerScreenState();
}

class _ComplaintDetailCustomerScreenState
    extends State<ComplaintDetailCustomerScreen> {
  final _api = ApiService();
  List<ComplaintResponse> _responses = [];
  List<dynamic> _suratKuasaFiles = [];
  bool _loadingFiles = false;

  @override
  void initState() {
    super.initState();
    _loadResponses();
    _loadSuratKuasa();
  }

  void _loadResponses() {
    if (widget.complaint.responses != null) {
      setState(() {
        _responses = (widget.complaint.responses as List)
            .map((json) => ComplaintResponse.fromJson(json))
            .toList();
      });
    }
  }

  Future<void> _loadSuratKuasa() async {
    setState(() => _loadingFiles = true);
    try {
      final res = await _api.getSuratKuasa(widget.complaint.ticketCode);
      if (res.statusCode == 200) {
        setState(() => _suratKuasaFiles = res.data);
      }
    } catch (_) {}
    setState(() => _loadingFiles = false);
  }

  Future<void> _download(String path) async {
    final url = Uri.parse('${ApiService.baseUrl.replaceAll("/api", "")}/$path');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complaint Detail'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ticket Code & Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    widget.complaint.ticketCode,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                ),
                StatusBadge(status: widget.complaint.status),
              ],
            ),
            const SizedBox(height: 16),

            // Subject
            const Text(
              'Subject:',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              widget.complaint.subject,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Description
            const Text(
              'Description:',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              widget.complaint.description,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),

            // Customer Info
            _buildInfoRow('Customer', widget.complaint.customerName),
            _buildInfoRow('Email', widget.complaint.customerEmail),
            if (widget.complaint.phone != null)
              _buildInfoRow('Phone', widget.complaint.phone!),
            _buildInfoRow('Category', widget.complaint.category),
            if (widget.complaint.location != null)
              _buildInfoRow('Location', widget.complaint.location!),
            if (widget.complaint.city != null)
              _buildInfoRow('City', widget.complaint.city!),
            _buildInfoRow(
                'Created', widget.complaint.createdAt.toString().split('.')[0]),

            const Divider(height: 32),

            // Responses
            const Text(
              'Communication History',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_responses.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'No responses yet',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              ..._responses
                  .where((r) => !r.isInternal)
                  .map((response) => ResponseBubble(
                        response: response,
                        isAgent: response.responderId != null,
                      )),

            const Divider(height: 32),

            // Surat Kuasa Section
            const Text(
              'Documents (Surat Kuasa)',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_loadingFiles)
              const LoadingIndicator(message: 'Loading documents...')
            else if (_suratKuasaFiles.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'No documents available yet',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              ..._suratKuasaFiles.map(
                (f) => Card(
                  child: ListTile(
                    leading: const Icon(Icons.file_present),
                    title: Text(
                      f['uploaded_by'] == 'ADMIN'
                          ? 'Draft (from Admin)'
                          : 'Signed (from Customer)',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      'Uploaded: ${f['created_at'].toString().split('T')[0]}',
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.download),
                      onPressed: () => _download(f['file_path']),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}
