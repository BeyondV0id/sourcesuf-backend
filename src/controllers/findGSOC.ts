import { Request, Response } from 'express';
import axios from 'axios';

export const findGSOC = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 30;
    const { data } = await axios.get(
      'https://api.gsocorganizations.dev/2025.json'
    );
    const organizaitons = data.organizations;
    const pageStart = (page - 1) * perPage;
    const end = pageStart + perPage;
    const paginatedOrgs = organizaitons.slice(pageStart, end);

    res.json({
      year: data.year,
      total: organizaitons.length,
      page,
      perPage,
      totalPages: Math.ceil(organizaitons.length / perPage),
      organizaitons: paginatedOrgs,
    });
    console.log(organizaitons);
  } catch (e) {
    console.error('Error fetching data: ', e);
    res.status(500).json({ message: 'Failed to fetch GSOC' });
  }
};
