import {MigrationInterface, QueryRunner, Column, TableColumn, TableForeignKey} from "typeorm";

export default class CreateTransactionCategoryFK1594399993316 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            'transactions',
            new TableColumn({
                name: 'category_id',
                type: 'uuid',
                isNullable: false
            })
        );

        await queryRunner.createForeignKey(
            'transactions',
            new TableForeignKey({
                name: 'TransactionCategoryFK',
                columnNames: ['category_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'SET NULL'
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey('transactions', 'TransactionCategoryFK');
        await queryRunner.dropColumn('transactions', 'category_id');
    }

}
