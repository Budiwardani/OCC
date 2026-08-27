class Invoice {
  final int id;
  final String ticketCode;
  final String customerName;
  final String customerEmail;
  final double amount;
  final String? description;
  final int createdBy;
  final DateTime createdAt;

  Invoice({
    required this.id,
    required this.ticketCode,
    required this.customerName,
    required this.customerEmail,
    required this.amount,
    this.description,
    required this.createdBy,
    required this.createdAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'],
      ticketCode: json['ticket_code'] ?? '',
      customerName: json['customer_name'] ?? '',
      customerEmail: json['customer_email'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      description: json['description'],
      createdBy: json['created_by'] ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ticket_code': ticketCode,
      'customer_name': customerName,
      'customer_email': customerEmail,
      'amount': amount,
      'description': description,
      'created_by': createdBy,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
