import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../api/api_service.dart';

class AdminSuratKuasaScreen extends StatefulWidget {
  const AdminSuratKuasaScreen({super.key});

  @override
  State<AdminSuratKuasaScreen> createState() => _AdminSuratKuasaScreenState();
}

class _AdminSuratKuasaScreenState extends State<AdminSuratKuasaScreen> {
  final _ticketCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _api = ApiService();

  List<dynamic> _fileList = [];
  bool _loading = false;
  bool _searched = false;
  String? _lookupMsg;

  _search() async {
    if (_ticketCtrl.text.isEmpty) return;
    setState(() {
      _loading = true;
      _searched = true;
      _fileList = [];
      _lookupMsg = null;
    });

    try {
      final res = await _api.getSuratKuasa(_ticketCtrl.text);
      if (res.statusCode == 200) {
        setState(() => _fileList = res.data);
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  _lookupByPhone() async {
    if (_phoneCtrl.text.isEmpty) return;
    setState(() {
      _loading = true;
      _lookupMsg = "Searching...";
    });

    try {
      final res = await _api.lookupTicketByPhone(_phoneCtrl.text);
      if (res.statusCode == 200) {
        final ticket = res.data['ticket_code'];
        final name = res.data['customer_name'];
        _ticketCtrl.text = ticket;
        setState(() => _lookupMsg = "Found: $name ($ticket)");
        _search(); // Auto search files
      }
    } catch (e) {
      setState(() => _lookupMsg = "No ticket found for this number.");
    } finally {
      setState(() => _loading = false);
    }
  }

  _download(String path) async {
    final url = Uri.parse('${ApiService.baseUrl.replaceAll("/api", "")}/$path');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Manage Surat Kuasa")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Phone Lookup Section
            const Text("Find by Phone/WA",
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                        labelText: "Phone Number",
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                    onPressed: _loading ? null : _lookupByPhone,
                    style:
                        ElevatedButton.styleFrom(backgroundColor: Colors.teal),
                    child: const Text("Lookup"))
              ],
            ),
            if (_lookupMsg != null)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Text(_lookupMsg!,
                    style: TextStyle(
                        color: _lookupMsg!.startsWith("Found")
                            ? Colors.green
                            : Colors.red,
                        fontWeight: FontWeight.bold)),
              ),

            const Divider(height: 32),

            // Ticket Search Section
            const Text("Search by Ticket Code",
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _ticketCtrl,
                    decoration: const InputDecoration(
                        labelText: "Ticket Code",
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                    onPressed: _loading ? null : _search,
                    child: const Text("Search"))
              ],
            ),
            const SizedBox(height: 16),

            // List Section
            SizedBox(
              height: 400, // Fixed height for list
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _fileList.isEmpty && _searched
                      ? const Center(child: Text("No files found."))
                      : ListView.builder(
                          itemCount: _fileList.length,
                          itemBuilder: (ctx, i) {
                            final file = _fileList[i];
                            final isAdmin = file['uploaded_by'] == 'ADMIN';
                            return Card(
                              color: isAdmin
                                  ? Colors.blue.shade50
                                  : Colors.green.shade50,
                              child: ListTile(
                                leading: Icon(
                                  isAdmin
                                      ? Icons.admin_panel_settings
                                      : Icons.verified,
                                  color: isAdmin ? Colors.blue : Colors.green,
                                ),
                                title: Text(isAdmin
                                    ? "Draft (Admin)"
                                    : "SIGNED (Customer)"),
                                subtitle: Text(file['created_at']
                                    .toString()
                                    .substring(0, 16)),
                                trailing: IconButton(
                                  icon: const Icon(Icons.download),
                                  onPressed: () => _download(file['file_path']),
                                ),
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
