import { ObjectId } from "mongodb";

export interface TMobile {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  rating: number;
  star: number;
  image: string[];
}