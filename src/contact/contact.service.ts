import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateInfoDto } from './dto/update-info.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async init(dto: CreateContactDto) {
    const exists = await this.contactModel.findOne();
    if (exists) return exists;
    return this.contactModel.create(dto);
  }

  async getDoc() {
    const doc = await this.contactModel.findOne();
    if (!doc) throw new NotFoundException('Contact not initialized');
    return doc;
  }

  async getInfo() {
    const doc = await this.getDoc();
    return {
      companyName: doc.companyName,
      phone: doc.phone,
      landline: doc.landline,
      email: doc.email,
      website: doc.website,
      aboutUs: doc.aboutUs,
    };
  }

  async getTerms() {
    const doc = await this.getDoc();
    return doc.termsOfService;
  }

  async getPrivacy() {
    const doc = await this.getDoc();
    return doc.privacyPolicy;
  }

  async updateInfo(dto: UpdateInfoDto) {
    const doc = await this.getDoc();
    Object.assign(doc, dto);
    return doc.save();
  }

  async updateTerms(terms: string[]) {
    const doc = await this.getDoc();
    doc.termsOfService = terms;
    return doc.save();
  }

  async updatePrivacy(privacy: string[]) {
    const doc = await this.getDoc();
    doc.privacyPolicy = privacy;
    return doc.save();
  }

  async adminAll() {
    return this.getDoc();
  }
}
