import 'package:flutter/material.dart';
import '../models/response.dart';

class ResponseBubble extends StatelessWidget {
  final ComplaintResponse response;
  final bool isAgent;

  const ResponseBubble({
    super.key,
    required this.response,
    required this.isAgent,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isAgent ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        padding: const EdgeInsets.all(12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: response.isInternal
              ? Colors.yellow[100]
              : (isAgent ? Colors.blue[50] : Colors.green[50]),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: response.isInternal
                ? Colors.yellow[700]!
                : (isAgent ? Colors.blue[200]! : Colors.green[200]!),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (response.isInternal)
              Row(
                children: [
                  Icon(Icons.lock, size: 12, color: Colors.yellow[900]),
                  const SizedBox(width: 4),
                  Text(
                    'INTERNAL',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.yellow[900],
                    ),
                  ),
                ],
              ),
            if (response.responderName != null) ...[
              Text(
                response.responderName!,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 4),
            ],
            Text(
              response.message,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text(
              _formatDate(response.createdAt),
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
