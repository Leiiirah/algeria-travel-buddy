import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Command } from '../commands/entities/command.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { User } from '../users/entities/user.entity';
import { Document } from '../documents/entities/document.entity';
import { SupplierTransaction } from '../supplier-transactions/entities/supplier-transaction.entity';
import { Payment } from '../payments/entities/payment.entity';

export interface SearchResult {
    id: string;
    type: 'command' | 'supplier' | 'employee' | 'document' | 'transaction' | 'payment';
    label: string;
    sublabel: string;
    url: string;
}

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(Command)
        private commandRepository: Repository<Command>,
        @InjectRepository(Supplier)
        private supplierRepository: Repository<Supplier>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
        @InjectRepository(SupplierTransaction)
        private transactionRepository: Repository<SupplierTransaction>,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
    ) { }

    async search(query: string, limit: number = 5): Promise<SearchResult[]> {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = `%${query.toLowerCase()}%`;
        const results: SearchResult[] = [];

        // 1. Search Commands
        const commands = await this.commandRepository
            .createQueryBuilder('command')
            .where(
                new Brackets((qb) => {
                    qb.where("command.data->>'clientFullName' ILIKE :search", { search: searchTerm })
                        .orWhere("command.data->>'phone' ILIKE :search", { search: searchTerm })
                        .orWhere('command.destination ILIKE :search', { search: searchTerm });
                }),
            )
            .orderBy('command.createdAt', 'DESC')
            .take(limit)
            .getMany();

        commands.forEach((cmd) => {
            const clientName = (cmd.data as any).clientFullName || 'Client Inconnu';
            results.push({
                id: cmd.id,
                type: 'command',
                label: `${clientName} - ${cmd.destination || 'Sans destination'}`,
                sublabel: `Commande ${(cmd.data as any).type || 'Inconnue'}`,
                url: `/commandes?search=${encodeURIComponent(clientName)}`,
            });
        });

        // 2. Search Suppliers
        const suppliers = await this.supplierRepository
            .createQueryBuilder('supplier')
            .where('supplier.name ILIKE :search', { search: searchTerm })
            .orWhere('supplier.contact ILIKE :search', { search: searchTerm })
            .orWhere('supplier.email ILIKE :search', { search: searchTerm })
            .take(limit)
            .getMany();

        suppliers.forEach((sup) => {
            results.push({
                id: sup.id,
                type: 'supplier',
                label: sup.name,
                sublabel: sup.contact,
                url: `/fournisseurs?search=${encodeURIComponent(sup.name)}`,
            });
        });

        // 3. Search Employees (Users)
        const users = await this.userRepository
            .createQueryBuilder('user')
            .where('user.firstName ILIKE :search', { search: searchTerm })
            .orWhere('user.lastName ILIKE :search', { search: searchTerm })
            .orWhere('user.email ILIKE :search', { search: searchTerm })
            .take(limit)
            .getMany();

        users.forEach((user) => {
            results.push({
                id: user.id,
                type: 'employee',
                label: `${user.firstName} ${user.lastName}`,
                sublabel: user.email,
                url: `/employes?search=${encodeURIComponent(user.email)}`,
            });
        });

        // 4. Search Documents
        const documents = await this.documentRepository
            .createQueryBuilder('document')
            .where('document.name ILIKE :search', { search: searchTerm })
            .orWhere('document.category::text ILIKE :search', { search: searchTerm })
            .take(limit)
            .getMany();

        documents.forEach((doc) => {
            results.push({
                id: doc.id,
                type: 'document',
                label: doc.name,
                sublabel: `Document ${doc.category}`,
                url: `/documents?search=${encodeURIComponent(doc.name)}`,
            });
        });

        // 5. Search Supplier Transactions
        const transactions = await this.transactionRepository
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.supplier', 'supplier')
            .where('transaction.note ILIKE :search', { search: searchTerm })
            .orWhere('transaction.amount::text ILIKE :search', { search: searchTerm })
            .orWhere('supplier.name ILIKE :search', { search: searchTerm })
            .take(limit)
            .getMany();

        transactions.forEach((tx) => {
            results.push({
                id: tx.id,
                type: 'transaction',
                label: `${tx.supplier?.name || 'Inconnu'} - ${tx.amount} DZD`,
                sublabel: `Transaction (${tx.type}) - ${tx.note || 'Sans note'}`,
                url: `/situation-fournisseurs?search=${encodeURIComponent(tx.supplier?.name || '')}`,
            });
        });

        // 6. Search Payments
        const payments = await this.paymentRepository
            .createQueryBuilder('payment')
            .where('payment.notes ILIKE :search', { search: searchTerm })
            .orWhere('payment.method::text ILIKE :search', { search: searchTerm })
            .orWhere('payment.amount::text ILIKE :search', { search: searchTerm })
            .take(limit)
            .getMany();

        payments.forEach((payment) => {
            results.push({
                id: payment.id,
                type: 'payment',
                label: `${payment.amount} DZD - ${payment.method}`,
                sublabel: `Paiement ${payment.notes ? `- ${payment.notes}` : ''}`,
                url: `/comptabilite?search=${encodeURIComponent(payment.amount.toString())}`,
            });
        });

        return results;
    }
}
